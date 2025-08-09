package com.smartedu.learningpath.course;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "modules")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    // Used to order modules within a course (e.g., 1, 2, 3... :)
    private int moduleOrder;

    // Relationship back to the course
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // A module contains a list of learning resources
    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Resource> resources;
}