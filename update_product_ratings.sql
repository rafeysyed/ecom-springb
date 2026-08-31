-- Script to update products with realistic normally distributed ratings (1.0 to 5.0) 
-- and random reviews_count (between 1 and 1000).
--
-- Uses Box-Muller transform:
-- sqrt(-2 * ln(u1)) * cos(2 * pi * u2) generates standard normal N(0,1).
-- Scaled with mean = 4.2 and stddev = 0.55, clamped between 1.0 and 5.0, rounded to 1 decimal.

UPDATE products
SET 
    rating = ROUND(
        LEAST(5.0, GREATEST(1.0, 
            4.2 + 0.55 * (
                SQRT(-2.0 * LN(GREATEST(0.0001, RANDOM()))) * 
                COS(2.0 * PI() * RANDOM())
            )
        ))::numeric, 
        1
    ),
    reviews_count = FLOOR(RANDOM() * 1000 + 1)::integer;
