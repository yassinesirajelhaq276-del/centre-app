-- Replace placeholder courses with three engineering courses
-- Update student course references to valid new courses before deleting old ones

-- First, update any students referencing old course names to a default new course
UPDATE students SET course = 'Génie informatique'
  WHERE course NOT IN ('Génie informatique', 'Génie civil', 'Génie industriel');

-- Delete all old courses
DELETE FROM courses;

-- Insert the three engineering courses
INSERT INTO courses (name, description, price) VALUES
  ('Génie civil',
   'Apprenez la conception, la construction et la gestion de projets d''infrastructure, des structures en béton aux ouvrages d''art.',
   550),
  ('Génie industriel',
   'Optimisez les processus de production, la logistique et la gestion de la qualité pour améliorer la performance des systèmes industriels.',
   500),
  ('Génie informatique',
   'Maîtrisez les fondamentaux de la programmation, des réseaux et du développement logiciel pour concevoir des solutions informatiques innovantes.',
   600);
