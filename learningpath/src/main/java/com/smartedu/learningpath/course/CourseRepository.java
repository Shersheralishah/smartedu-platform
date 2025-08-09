package com.smartedu.learningpath.course;

import com.smartedu.learningpath.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("SELECT c FROM Course c WHERE c.instructor = :instructor")
    Page<Course> findByInstructor(@Param("instructor") User instructor, Pageable pageable);

    /**
     * ✅ DEFINITIVE FIX: Uses a standard and robust JPQL query for case-insensitive search.
     * This syntax is guaranteed to be parsed correctly by the database.
     */
    @Query("SELECT c FROM Course c WHERE c.instructor = :instructor AND " +
            "(LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Course> searchByInstructor(@Param("instructor") User instructor, @Param("query") String query, Pageable pageable);

    /**
     * ✅ DEFINITIVE FIX: Uses a standard and robust JPQL query for case-insensitive search.
     */
    @Query("SELECT c FROM Course c WHERE " +
            "LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Course> searchAllCourses(@Param("query") String query, Pageable pageable);
}