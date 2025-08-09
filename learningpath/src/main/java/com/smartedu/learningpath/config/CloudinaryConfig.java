package com.smartedu.learningpath.config;


import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary(){
        //You will get all the keys from cloudinary itself so dont worry :)
        final Map<String,String> config = new HashMap<>();
        config.put("cloud_name","Your_cloud_name_:)");
        config.put("api_key","Your_Cloudinary_api_key_:)");
        config.put("api_secret","Your_api_secret_key_:)");

        return new Cloudinary(config);
    }
}
