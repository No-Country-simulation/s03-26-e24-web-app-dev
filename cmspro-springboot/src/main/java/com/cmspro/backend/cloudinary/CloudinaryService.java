package com.cmspro.backend.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryResponse uploadAndGetUrl(MultipartFile multipartFile) throws IOException {

        Map<?, ?> result = cloudinary.uploader().upload(multipartFile.getBytes(), ObjectUtils.emptyMap());

        String readableSize = formatBytes((Integer) result.get("bytes"));

        return new CloudinaryResponse(
                (String) result.get("secure_url"),
                (Integer) result.get("width"),
                (Integer) result.get("height"),
                readableSize
        );

    }

    public static String formatBytes(long bytes) {
        double kb = bytes / 1024.0;
        double mb = kb / 1024.0;
        double gb = mb / 1024.0;

        if (gb >= 1) return String.format("%.2f GB", gb);
        if (mb >= 1) return String.format("%.2f MB", mb);
        if (kb >= 1) return String.format("%.2f KB", kb);
        return bytes + " B";
    }

}
