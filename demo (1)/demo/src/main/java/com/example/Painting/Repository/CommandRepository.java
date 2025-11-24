package com.example.Painting.Repository;

import com.example.Painting.CommandPattern.Command;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommandRepository extends JpaRepository<Command,Long> {

    Optional<Command> findTopByUndoFalseOrderByIdDesc();
    Optional<Command> findTopByUndoTrueOrderByIdAsc();
}
