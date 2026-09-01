package com.github.wekaito.backend.security;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MongoUserRepository extends MongoRepository<MongoUser, String> {

    Optional<MongoUser> findByUsername(String username);

    @Query("{ 'username': ?0 }")
    @Update("{ '$set': { 'activeDeckId': ?1 } }")
    long updateActiveDeckIdByUsername(String username, String deckId);

}
