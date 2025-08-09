package com.smartedu.learningpath.social;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface SocialLinkRepository extends JpaRepository<SocialLink, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM SocialLink s WHERE s.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    List<SocialLink> findByUserId(Long userId);
}

