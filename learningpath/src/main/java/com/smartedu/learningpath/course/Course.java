package com.smartedu.learningpath.course;

import com.smartedu.learningpath.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "courses")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Path to a cover image, stored locally
    private String thumbnailPath;


    //  PRICE AND CURRENCY FIELDS
    @Column(precision = 10, scale = 2) // e.g., 99999999.99
    private BigDecimal price;

    @Column(precision = 5, scale = 2) // e.g., 25.00 for 25%
    private BigDecimal discountPercentage;
    

    // Relationship to the instructor who created the course
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;

    // A course contains a list of modules, ordered by 'moduleOrder'
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("moduleOrder ASC")
    private List<Module> modules;



    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}