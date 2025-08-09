package com.smartedu.learningpath.course;

import com.smartedu.learningpath.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    Optional<Enrollment> findByStudentAndCourse(User student, Course course);
    List<Enrollment> findAllByStudent(User student);

    //  THIS METHOD: Finds all enrollment records for a given course.
    List<Enrollment> findAllByCourse(Course course);


    void deleteAllByCourse(Course course);
    int countByCourse(Course course);
}

