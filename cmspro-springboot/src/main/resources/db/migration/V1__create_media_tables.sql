-- Cloudinary
CREATE TABLE images (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        public_id VARCHAR(255) NOT NULL,
                        secure_url TEXT NOT NULL,
                        file_format VARCHAR(10),
                        width INTEGER,
                        height INTEGER,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- YouTube
CREATE TABLE videos (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        video_id VARCHAR(50) NOT NULL,
                        title VARCHAR(255),
                        thumbnail_url TEXT,
                        platform VARCHAR(20) DEFAULT 'YOUTUBE',
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);