package com.example.Painting.CommandPattern;

import com.example.Painting.Entities.Shape;
import lombok.Data;

@Data
public class Response {
    public Shape shape;
    public String operation;
    public Response(Shape shape,String operation){
        this.shape=shape;
        this.operation=operation;
    }
}