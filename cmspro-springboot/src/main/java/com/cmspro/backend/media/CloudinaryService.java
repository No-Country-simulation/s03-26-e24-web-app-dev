package com.cmspro.backend.media;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final ImageRepository imageRepository;

    public Image uploadAndSave(MultipartFile multipartFile) throws IOException {

        Map result = cloudinary.uploader().upload(multipartFile.getBytes(), ObjectUtils.emptyMap());

        Image image = Image.builder()
                .publicId(result.get("public_id").toString())
                .secure_url(result.get("secure_url").toString())
                .file_format(result.get("format").toString())
                .width((Integer) result.get("width"))
                .height((Integer) result.get("height"))
                .build();

        return imageRepository.save(image);
    }

    public List<Image> findAll() {
        return imageRepository.findAll();
    }
}
