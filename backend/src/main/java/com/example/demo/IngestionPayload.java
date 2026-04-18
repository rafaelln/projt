package com.example.demo;

public class IngestionPayload {
    private String type;
    private String nome;
    private Long timestamp;
    private Position posicao;
    private String sessao;

    public IngestionPayload() {}

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    public Position getPosicao() {
        return posicao;
    }

    public void setPosicao(Position posicao) {
        this.posicao = posicao;
    }

    public String getSessao() {
        return sessao;
    }

    public void setSessao(String sessao) {
        this.sessao = sessao;
    }

    @Override
    public String toString() {
        return "IngestionPayload{" +
                "type='" + type + '\'' +
                ", nome='" + nome + '\'' +
                ", timestamp=" + timestamp +
                ", posicao=" + posicao +
                ", sessao='" + sessao + '\'' +
                '}';
    }
}
