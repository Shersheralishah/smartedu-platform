package com.smartedu.learningpath.course;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resources")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Enumerated(EnumType.STRING)
    private ResourceType resourceType;


    private String filePath;


    private String url;


    private Integer estimatedTimeToCompleteMinutes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    public enum ResourceType {
        PDF,
        VIDEO,
        LINK,
        TEXT
    }
}