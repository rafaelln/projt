package com.example.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Permite requisições do frontend local
public class IngestionController {

    @PostMapping("/ingestion")
    public ResponseEntity<Map<String, String>> ingestData(@RequestBody IngestionPayload payload) {
        // Loga os dados no console conforme solicitado
        System.out.println("===============================");
        System.out.println("NOVO EVENTO RECEBIDO: " + payload.getType());
        System.out.println("Payload: " + payload);
        System.out.println("===============================");
        
        String flowId = UUID.randomUUID().toString();
        
        Map<String, String> response = new HashMap<>();
        response.put("message", payload.getType() + " executado com sucesso");
        response.put("flowId", flowId);

        return ResponseEntity.ok(response);
    }
}
