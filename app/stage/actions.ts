'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

interface WeightedInfo {
  sum: number
  weight: number
}

interface UserDetails {
  userId: number
  last5JokeIds: number[]
}

interface RatingInsert {
  user_id: number
  joke_id: number
  rating: number
}

interface JokeRecommendation {
  joke_id: number
  joke_text: string
  final_score: number
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

// Simple function to get user_id and last_5_jokeIds
export async function getUserDetails(): Promise<UserDetails | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
  
    if (error || !data?.user) {
      redirect('/login')
    }
  
    const userId = data.user.id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, last_5_jokeIds')
      .eq('id', userId)
      .single();
  
    if (profileError || !profileData) {
      console.error('Error fetching profile details:', profileError?.message);
      redirect('/login');
    }
  
    return {
      userId: profileData.user_id,
      last5JokeIds: profileData.last_5_jokeIds || [],
    };
  } catch (error) {
    console.error('Error fetching user details:', error);
    redirect('/login');
  }
}

// Function to rate a joke and update the user's last_5_jokeIds
// If the user already had 5 jokes in the list, we remove the oldest one
export async function rateJoke(user_id: number, joke_id: number, rating: number): Promise<RatingInsert | null> {
  try {
    const supabase = await createClient()
  
    const { data: ratingInsert, error: ratingError } = await supabase
      .from('ratings')
      .insert([{ user_id, joke_id, rating }])
      .select()
  
    if (ratingError) {
      console.error('rating error: ', ratingError)
      return null
    }
  
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('last_5_jokeIds')
      .eq('user_id', user_id)
      .single()
  
    if (profileError) {
      console.error('profile error: ', profileError)
      return null
    }
  
    const last5JokeIds = profileData.last_5_jokeIds || []
  
    const updatedJokes = [...last5JokeIds, joke_id]
    if (updatedJokes.length > 5) {
      updatedJokes.shift()
    }
  
    const { data: profileUpdate, error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ last_5_jokeIds: updatedJokes })
      .eq('user_id', user_id)
  
    if (profileUpdateError) {
      console.error('profile update error: ', profileUpdateError)
      return null
    }
  
    return ratingInsert[0]
  } catch (error) {
    console.error('Error rating joke:', error)
    return null
  }
}

export async function getJoke(userId: number, last5JokeIds: number[]): Promise<JokeRecommendation | null> {
  try {
    const supabase = await createClient()
  
    // 1) Fetch all the jokes this user has rated => to exclude from rec
    const { data: allUserRatings, error: userRatingsError } = await supabase
      .from('ratings')
      .select('joke_id, rating')
      .eq('user_id', userId)
  
    if (userRatingsError) {
      console.error('userRatingsError: ', userRatingsError)
      return null
    }
  
    const userRatedJokeIds = allUserRatings?.map((r) => r.joke_id) || []
  
    // 2) Cold start check: If user has rated fewer than 5 jokes => return random joke that user hasn't rated
    if (userRatedJokeIds.length < 5) {
      const { data: randomData, error: randomError } = await supabase.rpc(
        'get_random_joke_excluding',
        { _excluded_ids: userRatedJokeIds }
      )
      if (randomError) {
        console.error('randomError: ', randomError)
        return null
      }
      if (!randomData || randomData.length === 0) {
        console.error('No more jokes left for cold-start user.')
        return null
      }

      return {
        joke_id: randomData[0].joke_id,
        joke_text: randomData[0].joke_text,
        final_score: 1,
      }
    }
  
    // 3) Item-based candidates: Get similar jokes for the last 5 jokes rated by the user
    let candidateJokes: { id: number; joke_text: string; similarity: number }[] = []
  
    for (const jokeId of last5JokeIds) {
      const { data: similarJokes, error: similarError } = await supabase
        .rpc('get_similar_jokes_by_id', { _joke_id: jokeId })
  
      if (similarError) {
        console.error('similarError: ', similarError)
        return null
      }
      if (similarJokes) {
        candidateJokes.push(...similarJokes)
      }
    }
  
    // Filter out any jokes the user already rated:
    candidateJokes = candidateJokes.filter(
      (cand) => !userRatedJokeIds.includes(cand.id)
    )
  
    // Combine by joke_id => average similarity if a joke appears multiple times
    const similarityMap = new Map<number, { sum: number; count: number; joke_text: string }>()
    for (const c of candidateJokes) {
      const { id, joke_text, similarity } = c
      if (!similarityMap.has(id)) {
        similarityMap.set(id, { sum: similarity, count: 1, joke_text })
      } else {
        const entry = similarityMap.get(id)!
        entry.sum += similarity
        entry.count += 1
      }
    }
  
    // Convert map to array
    let itemSimilarityArray: {
      joke_id: number
      joke_text: string
      avg_similarity: number
    }[] = []
  
    // Calculate average similarity for each joke, and push to array
    for (const [jokeId, val] of similarityMap.entries()) {
      itemSimilarityArray.push({
        joke_id: jokeId,
        joke_text: val.joke_text,
        avg_similarity: val.sum / val.count,
      })
    }
  
    // 4) User-based candidates: Find top-5 similar users and their top rated jokes
    const { data: similarUsers, error: simUsersError } = await supabase.rpc(
      'get_top_similar_users',
      { _user_id: userId }
    )
    if (simUsersError) {
      console.error('simUsersError: ', simUsersError)
      return null
    }
    // If there are no similar users, we fall back to item-based only
    if (!similarUsers || similarUsers.length === 0) {
      console.error('No neighbors found => fallback to purely item-based rec...')
      return getBestItemBased(itemSimilarityArray, userRatedJokeIds)
    }
  
    // 5) Fetch top rated jokes from the similar users (neighbors)
    const neighborIds = similarUsers.map((u: any) => u.other_user_id)
    const { data: neighborsRatingsData, error: neighborsRatingsError } = await supabase
      .from('ratings')
      .select('user_id, joke_id, rating')
      .in('user_id', neighborIds)
      // .order('rating', { ascending: false })
      // .limit(10)
  
    if (neighborsRatingsError) {
      console.error('neighborsRatingsError: ', neighborsRatingsError)
      return null
    }
  
    const neighborRatingsMap = new Map<number, WeightedInfo>() // joke_id => WeightedInfo
  
    // Build a map of user_id -> similarity_score for quicker lookup
    const userSimMap = new Map<number, number>()
    for (const row of similarUsers) {
      userSimMap.set(row.other_user_id, row.similarity_score)
    }
  
    for (const nr of neighborsRatingsData || []) {
      const sim = userSimMap.get(nr.user_id)
      if (!sim || sim <= 0) continue // if 0 or not found, skip
  
      const { joke_id, rating } = nr
      if (!neighborRatingsMap.has(joke_id)) {
        neighborRatingsMap.set(joke_id, {
          sum: sim * rating,
          weight: sim,
        })
      } else {
        const existing = neighborRatingsMap.get(joke_id)!
        existing.sum += sim * rating
        existing.weight += sim
      }
    }
  
    // Convert neighborRatingsMap => final Weighted rating
    // userBasedRatings[joke_id] = average rating from top neighbors
    const userBasedRatings: Record<number, number> = {}
    for (const [jokeId, winfo] of neighborRatingsMap.entries()) {
      userBasedRatings[jokeId] = winfo.sum / winfo.weight
    }
  
    // 6) Combine item-based & user-based into a single candidate set
    const combinedJokeIds = new Set<number>([
      ...itemSimilarityArray.map((i) => i.joke_id),
      ...Object.keys(userBasedRatings).map((id) => Number(id)),
    ])
  
    // 7) Filter out jokes already rated/seen by the user (NEVER show them again)
    const unseenJokeIds = [...combinedJokeIds].filter(
      (jokeId) => !userRatedJokeIds.includes(jokeId)
    )
  
    if (unseenJokeIds.length === 0) {
      console.error('User has already rated all jokes from both approaches.')
      return null
    }
  
    const alpha = 0.7 // weight for user-based rating
    const beta = 0.3  // weight for item-based similarity
    
    // 8) Build final array with item-sim + user-based rating
    const itemSimMap = new Map<number, number>()
    const itemTextMap = new Map<number, string>()
    itemSimilarityArray.forEach((itm) => {
      itemSimMap.set(itm.joke_id, itm.avg_similarity)
      itemTextMap.set(itm.joke_id, itm.joke_text)
    })
  
    // Fetch joke_text for jokes that are missing in itemTextMap
    const missingIds = unseenJokeIds.filter((id) => !itemTextMap.has(id))
    let jokesTextData: { joke_id: number; joke_text: string }[] = []
    if (missingIds.length > 0) {
      const { data: jokesText, error: jokesTextErr } = await supabase
        .from('jokes')
        .select('joke_id, joke_text')
        .in('joke_id', missingIds)
      if (jokesTextErr) {
        console.error('jokesTextErr:', jokesTextErr)
        return null
      }
      jokesTextData = jokesText || []
      jokesTextData.forEach((j) => {
        itemTextMap.set(j.joke_id, j.joke_text)
      })
    }
  
    // 9) Calculate final score for each unseen joke
    const scoredCandidates = unseenJokeIds.map((jokeId) => {
      const sim = itemSimMap.get(jokeId) ?? 0
      const simScaled = scaleSimilarity(sim)
      const neighborWeightedRating = userBasedRatings[jokeId] ?? 0
  
      const finalScore = alpha * neighborWeightedRating + beta * simScaled
  
      return {
        joke_id: jokeId,
        joke_text: itemTextMap.get(jokeId) || '',
        neighbor_weighted_rating: neighborWeightedRating,
        avg_similarity: sim,
        similarity_scaled: simScaled,
        final_score: finalScore,
      }
    })
  
    scoredCandidates.sort((a, b) => b.final_score - a.final_score)
  
    // 10) Return top recommended joke (finally)
    const bestRecommendation = scoredCandidates[0]
    if (!bestRecommendation) {
      console.error('No suitable recommendation found.')
      return null
    }
  
    console.log(`Recommended joke_id = ${bestRecommendation.joke_id}, \nneighbor_weighted_rating = ${bestRecommendation.neighbor_weighted_rating}, \navg_similarity = ${bestRecommendation.avg_similarity}, \nsimilarity_scaled = ${bestRecommendation.similarity_scaled}, \nfinal_score = ${bestRecommendation.final_score}`)
  
    return {
      joke_id: bestRecommendation.joke_id,
      joke_text: bestRecommendation.joke_text,
      final_score: bestRecommendation.final_score,
    }
  } catch (error) {
    console.error('Error fetching joke:', error)
    return null
  }
}

// Fallback function to get the best item-based recommendation, used if no neighbors
function getBestItemBased(
  itemSimilarityArray: { joke_id: number; joke_text: string; avg_similarity: number }[],
  userRatedJokeIds: number[]
): JokeRecommendation | null {
  // Filter out jokes already rated by the user
  const filtered = itemSimilarityArray.filter(
    (itm) => !userRatedJokeIds.includes(itm.joke_id)
  )

  if (filtered.length === 0) {
    console.log('User has already rated all item-based jokes.')
    return null
  }

  // Get the highest similarity joke
  filtered.sort((a, b) => b.avg_similarity - a.avg_similarity)
  return {
    joke_id: filtered[0].joke_id,
    joke_text: filtered[0].joke_text,
    final_score: filtered[0].avg_similarity,
  }
}

function scaleSimilarity(sim: number): number {
  return 1 + sim * 4
}