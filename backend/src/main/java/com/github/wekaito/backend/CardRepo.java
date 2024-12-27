package com.github.wekaito.backend;
import com.github.wekaito.backend.models.Card;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardRepo extends MongoRepository<Card, String> {

}
