package com.smartedu.learningpath.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.smartedu.learningpath.FileUploadUtil;
import com.smartedu.learningpath.dto.CloudinaryResonse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryResonse uploadImage(MultipartFile file, String fileName) throws IOException {

        FileUploadUtil.assertAllowed(file, FileUploadUtil.IMAGE_PATTERN);


        String finalFileName = FileUploadUtil.getFileName(fileName);


        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("public_id", finalFileName));

        return new CloudinaryResonse(
                (String) uploadResult.get("public_id"),
                (String) uploadResult.get("secure_url")
        );
    }
}
