ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MANAGER';

UPDATE users
SET role = 'LEARNER'::"Role"
WHERE role = 'ADMIN'::"Role"
  AND lower(email) NOT IN ('sultaniyaaviral@gmail.com', 'codemva2025@gmail.com');

UPDATE users
SET role = 'ADMIN'::"Role"
WHERE lower(email) IN ('sultaniyaaviral@gmail.com', 'codemva2025@gmail.com');
