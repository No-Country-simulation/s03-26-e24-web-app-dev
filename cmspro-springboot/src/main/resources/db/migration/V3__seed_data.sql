-- 1. Insertar un Rol básico
INSERT INTO roles (id, name)
VALUES (uuid_generate_v4(), 'ADMIN');

-- 2. Insertar un Usuario
INSERT INTO users (id, role_id, email, password_hash, full_name)
VALUES (
           uuid_generate_v4(),
           (SELECT id FROM roles LIMIT 1),
           'dev@cmspro.com',
           'hash_simulado',
           'Developer Test'
       );

-- 3. Insertar una Categoría
INSERT INTO categories (id, name, slug, description)
VALUES (
           uuid_generate_v4(),
           'Software Development',
           'software-dev',
           'Testimonios sobre proyectos de software'
       );

-- 4. Insertar un Testimonio de prueba
INSERT INTO testimonials (id, title, body, author_name, status, category_id, created_by, slug)
VALUES (
           '88888888-4444-4444-4444-121212121212',
           'Proyecto MVP Exitoso',
           'Este es un testimonio de prueba para validar la subida de imágenes a Cloudinary.',
           'Juan Perez',
           'PUBLISHED',
           (SELECT id FROM categories LIMIT 1),
           (SELECT id FROM users LIMIT 1),
           'proyecto-mvp-exitoso'
       );