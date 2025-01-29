# Where to find the important parts in the code

This document gives pointers towards the most important parts of the code and is split up into several parts to make it easier to find:
 - **Main application:**
	This parts contains the logic for the joke recommender
 - **Supabase SQL functions:**
	 Additional functions that are being called from the application, mainly for optimization.
- **Data preparation:**
	Here you can find the code that is used to generate the embeddings, and prepare the data for the database where needed.
- **Machine Learning (ML):**
	This contains the code with (failed) attempts to improve the model further. 
	
## Main application:

The main logic can be found under `app/stage/actions.ts`.
This includes all the logic for recommending the next new joke.

The 3D scene is being rendered as a background, which can be found under `components/custom/scene.tsx`.

The auth logic is implementing/adapted according to the [Supabase tutorial](https://supabase.com/docs/guides/auth/server-side/nextjs)

## Supabase SQL functions:
### get_random_joke_excluding:

  ```
SELECT *
FROM jokes
WHERE NOT (joke_id = ANY(_excluded_ids))
ORDER BY random()
LIMIT 1;
  ```

### get_similar_jokes_by_id:
``` 
SELECT
    j.joke_id,
    j.joke_text,
    1 - (j.embedding <=> q.embedding) AS similarity
FROM jokes j
JOIN jokes q ON q.joke_id = _joke_id  -- reference joke
WHERE j.joke_id != _joke_id          -- exclude the same joke
ORDER BY j.embedding <=> q.embedding  -- ascending distance
LIMIT 5
  ```
### get_top_similar_users:
```
WITH target_user_ratings AS (
  SELECT joke_id, rating
  FROM ratings
  WHERE user_id = _user_id
),
neighbors AS (
  SELECT
    r.user_id AS other_user_id,
    SUM(ABS(r.rating - t.rating)) AS total_diff,
    COUNT(*) AS overlap_count,
    (SELECT COUNT(*) FROM target_user_ratings) AS user_count
  FROM ratings r
  JOIN target_user_ratings t USING (joke_id)
  WHERE r.user_id <> _user_id
  GROUP BY r.user_id
),
scored AS (
  SELECT
    other_user_id,
    CASE
      WHEN overlap_count = 0 THEN 0
      ELSE
        -- Partial-overlap similarity => more overlap = higher similarity
        (1.0 - (total_diff::float / (overlap_count * 4.0))) 
        * (overlap_count::float / user_count::float)
    END AS similarity_score
  FROM neighbors
)
SELECT other_user_id, similarity_score
FROM scored
ORDER BY similarity_score DESC
LIMIT 5;
```

### Data preparation:
The folder `data-prep` contains the attempts to improve the model. 
 - **jokes.csv:**
	Contains the initial set of jokes that we got from Kaggle.
 - **top_300_ratings.csv:**
	Contains the jokeIds and scaled ratings that were used. These are also from the Kaggle dataset.
 - **prep.ipynb:**
	Contains the code that was used to add the embeddings to the initial joke set.
 - **adjust_ratings.ipynb:**
	Used to scale the ratings such that it aligns with the rating system of the application
### Machine Learning (ML):
The folder `ml` contains the attempts to improve the model. 
 - **jokes_svd.ipynb**
	 Contains the SVD model to create a prediction matrix (is not used in the application, as we decided on a direct formula)
- **filtering_with_embeddings.ipynb**
	Contains the code to clean jokes with embeddings (was not ready enough to incorporate)
- **categorizing_jokes_with_embeddings.ipynb**
	Contains the code to categorize jokes programmatically (was not ready enough to incorporate)
- **finetuning_bert_for_jokes_filtering.ipynb**
	Contains the code to fine tune Bert to filter jokes (not optimized enough -> failed due to lack of GPU resources)
