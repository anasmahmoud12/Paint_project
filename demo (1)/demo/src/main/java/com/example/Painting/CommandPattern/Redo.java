package com.example.Painting.CommandPattern;

import com.example.Painting.Entities.Rectangle;
import com.example.Painting.Entities.Shape;
import com.example.Painting.Repository.CommandRepository;
import com.example.Painting.Repository.ShapeRepository;
import com.example.Painting.Service.ShapeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

@Service
public class Redo {
    @Autowired
    CommandRepository commandRepository;
    @Autowired
    ShapeRepository shapeRepository;
    @Autowired
    ObjectMapper objectMapper;
    public Response redo(){
        Command command=commandRepository.findTopByUndoTrueOrderByIdAsc().orElse(null);
        if(command==null){
//    throw  new RuntimeException("no further undo");
            Response response=new Response(new Rectangle(),"nothing to redo");
            return response;

        }
        command.setUndo(false);
        commandRepository.save(command);
        Shape oldState = null;
        Shape newState = null;

        try {
            if (command.getOldState() != null)
                oldState = objectMapper.readValue(command.getOldState(), Shape.class);

            if (command.getNewState() != null)
                newState = objectMapper.readValue(command.getNewState(), Shape.class);

        } catch (Exception e) {
            throw new RuntimeException("Cannot map JSON to Shape");
        }






        if (     command.getType().equals("CHANGE_STROKECOLOR")
                ||command.getType().equals("CHANGE_FILLCOLOR")
                ||command.getType().equals("ROTATION")
                ||command.getType().equals("MOVE")
                ||command.getType().equals("CHANGE_STROKEWIDTH")     ) {


            shapeRepository.save(newState);
            Response response=new Response(newState,"changeTo");
            return response;

        }





        else if(command.getType().equals("CREATE_SHAPE")||command.getType().equals("COPY")){
            ++ShapeService.counter;

            newState.setId(ShapeService.counter);
            shapeRepository.save(newState);

            Response response=new Response(newState,"create");
            return  response;


        }





        else  if(command.getType().equals("DELETE_SHAPE")){
            --ShapeService.counter;
            shapeRepository.deleteById(oldState.getId());

            Response response=new Response(oldState,"delete");
            return response;

        }







        else {
            throw new RuntimeException("not have this operation ");
        }















    }

}
