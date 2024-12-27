package com.github.wekaito.backend;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeckRepo extends MongoRepository<Deck, String> {
    List<Deck> findByAuthorId(String authorId);
}
