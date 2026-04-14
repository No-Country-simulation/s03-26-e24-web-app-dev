-- 1. Tabla de Copias de Testimonios
CREATE TABLE testimonial_copies (
                                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                    testimonial_id UUID REFERENCES testimonials(id) ON DELETE CASCADE,
                                    type VARCHAR(50),
                                    title VARCHAR(255),
                                    body TEXT,
                                    extended_body TEXT,
                                    author_name VARCHAR(100),
                                    author_role VARCHAR(100),
                                    author_organization VARCHAR(100),
                                    category_id UUID REFERENCES categories(id),
                                    status VARCHAR(20) DEFAULT 'PENDING_REVIEW',
                                    created_by UUID REFERENCES users(id),
                                    reviewed_by UUID REFERENCES users(id),
                                    reviewed_at TIMESTAMPTZ,
                                    review_comment TEXT,
                                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Media Assets específicos para la Copia
-- (Siguiendo tu diagrama: TESTIMONIAL_COPY_MEDIA_ASSET)
CREATE TABLE testimonial_copy_media_assets (
                                               id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                               testimonial_copy_id UUID REFERENCES testimonial_copies(id) ON DELETE CASCADE,
                                               media_type VARCHAR(20) NOT NULL,
                                               provider VARCHAR(20) NOT NULL,
                                               url TEXT NOT NULL,
                                               public_id VARCHAR(255),
                                               thumbnail_url TEXT,
                                               alt_text VARCHAR(255),
                                               sort_order INT DEFAULT 0,
                                               created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de relación para Tags de la Copia
CREATE TABLE testimonial_copy_tags (
                                       testimonial_copy_id UUID REFERENCES testimonial_copies(id) ON DELETE CASCADE,
                                       tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
                                       PRIMARY KEY (testimonial_copy_id, tag_id)
);