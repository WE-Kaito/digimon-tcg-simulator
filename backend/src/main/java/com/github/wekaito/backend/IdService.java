package com.github.wekaito.backend;

import org.springframework.stereotype.Component;

import java.util.UUID;
@Component
public
class IdService {

    public String createId(){
        return UUID.randomUUID().toString();
    }
}
