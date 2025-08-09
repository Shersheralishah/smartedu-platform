package com.smartedu.learningpath.profile;

import com.smartedu.learningpath.dto.CloudinaryResonse;
import com.smartedu.learningpath.dto.SocialLinkDto;
import com.smartedu.learningpath.dto.UserProfileRequest;
import com.smartedu.learningpath.dto.UserProfileResponse;
import com.smartedu.learningpath.config.JwtService;
import com.smartedu.learningpath.service.CloudinaryService;
import com.smartedu.learningpath.social.SocialLink;
import com.smartedu.learningpath.social.SocialLinkRepository;
import com.smartedu.learningpath.user.User;
import com.smartedu.learningpath.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final SocialLinkRepository socialLinkRepository;
    private final CloudinaryService cloudinaryService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        UserProfile profile = user.getProfile();
        List<SocialLink> socialLinks = user.getSocialLinks();

        UserProfileResponse response = UserProfileResponse.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .headline(profile != null ? profile.getHeadline() : "")
                .biography(profile != null ? profile.getBio() : "")
                .language(profile != null ? profile.getLanguage() : "")
                .profileImage(profile != null ? profile.getProfileImage() : "")
                .socialLinks(
                        socialLinks.stream()
                                .map(link -> new SocialLinkDto(link.getPlatform(), link.getUrl()))
                                .collect(Collectors.toList())
                )
                .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(
            @RequestBody UserProfileRequest dto,
            Principal principal) {

        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (dto.getFirstName() != null && dto.getLastName() != null) {
            String newFullName = dto.getFirstName() + " " + dto.getLastName();
            user.setFullName(newFullName.trim());
            userRepository.save(user);
        }

        UserProfile profile = user.getProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
        }

        profile.setHeadline(dto.getHeadline());
        profile.setBio(dto.getBiography());
        profile.setLanguage(dto.getLanguage());
        profile.setProfileImage(dto.getProfileImage());

        profileRepository.save(profile);

        try {
            List<SocialLinkDto> links = dto.getSocialLinks();
            if (links != null) {
                socialLinkRepository.deleteByUserId(user.getId());

                List<SocialLink> newLinks = links.stream()
                        .map(linkDto -> SocialLink.builder()
                                .platform(linkDto.getPlatform())
                                .url(linkDto.getUrl())
                                .user(user)
                                .build())
                        .collect(Collectors.toList());

                socialLinkRepository.saveAll(newLinks);
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                    java.util.Map.of(
                            "error", "Failed to update social links",
                            "details", e.getMessage())
            );
        }

        return ResponseEntity.ok(
                java.util.Map.of("message", "Profile updated successfully")
        );
    }

    @PostMapping("/upload-image")
    public ResponseEntity<CloudinaryResonse> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name) throws IOException {

        CloudinaryResonse uploaded = cloudinaryService.uploadImage(file, name);
        return ResponseEntity.ok(uploaded);
    }
}
