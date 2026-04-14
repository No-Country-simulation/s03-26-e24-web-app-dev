-- Habilitar extensión para UUIDs si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tablas Maestras (Sin dependencias)
CREATE TABLE roles (
                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE categories (
                            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                            name VARCHAR(100) NOT NULL,
                            slug VARCHAR(100) NOT NULL UNIQUE,
                            description TEXT,
                            is_active BOOLEAN DEFAULT TRUE,
                            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
                      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                      name VARCHAR(50) NOT NULL,
                      slug VARCHAR(50) NOT NULL UNIQUE,
                      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Usuarios
CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       role_id UUID REFERENCES roles(id),
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(255),
                       is_active BOOLEAN DEFAULT TRUE,
                       created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Testimonios
CREATE TABLE testimonials (
                              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                              type VARCHAR(50),
                              title VARCHAR(255) NOT NULL,
                              body TEXT NOT NULL,
                              extended_body TEXT,
                              author_name VARCHAR(100),
                              author_role VARCHAR(100),
                              author_organization VARCHAR(100),
                              status VARCHAR(20) DEFAULT 'DRAFT',
                              category_id UUID REFERENCES categories(id),
                              created_by UUID REFERENCES users(id),
                              slug VARCHAR(255) UNIQUE,
                              featured BOOLEAN DEFAULT FALSE,
                              published_at TIMESTAMPTZ,
                              approved_at TIMESTAMPTZ,
                              rejection_reason TEXT,
                              is_deleted BOOLEAN DEFAULT FALSE,
                              created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Media Assets (Unificado para Cloudinary y YouTube)
CREATE TABLE media_assets (
                              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                              testimonial_id UUID REFERENCES testimonials(id) ON DELETE CASCADE,
                              media_type VARCHAR(20) NOT NULL, -- 'IMAGE', 'VIDEO'
                              provider VARCHAR(20) NOT NULL,   -- 'CLOUDINARY', 'YOUTUBE'
                              url TEXT NOT NULL,
                              public_id VARCHAR(255),          -- Cloudinary public_id o Youtube ID
                              thumbnail_url TEXT,
                              alt_text VARCHAR(255),
                              sort_order INT DEFAULT 0,
                              created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tablas de Relación (Muchos a Muchos)
CREATE TABLE testimonial_tags (
                                  testimonial_id UUID REFERENCES testimonials(id) ON DELETE CASCADE,
                                  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
                                  PRIMARY KEY (testimonial_id, tag_id)
);

-- Nota: He omitido TESTIMONIAL_COPY para simplificar el MVP inicial,
-- pero puedes agregarla siguiendo este mismo patrón de llaves foráneas.