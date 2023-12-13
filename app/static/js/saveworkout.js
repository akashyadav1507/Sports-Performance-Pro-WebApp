for (const block of blocks) {
  console.log("Block", block);
  SampleWorkoutData.blocks.push({
    block_id: block.id,
    name: block.childNodes[0].value,
    exercises: [],
  });
  const selectedBlockIndex = findBlockIndex(SampleWorkoutData.blocks, block.id);
  console.log("selectedBlockIndex", selectedBlockIndex);
  exercises = block.querySelectorAll(".exercise-buttons");
  console.log(exercises);
  for (const exercise of exercises) {
    console.log(exercise);
    const loadsRepsSets = FormatExerciseData(
      DataTableExerciseList[exercise.id]
    );

    SampleWorkoutData.blocks[selectedBlockIndex].exercises.push({
      exercise_id: exercise.id,
      name: exercise.querySelector(`#exerciseName-${exercise.id}`).options[
        exercise.querySelector(`#exerciseName-${exercise.id}`).selectedIndex
      ].textContent,
      exercise_class: "exercise-buttons",
      sets: loadsRepsSets.sets,
      loads_reps: {
        coach: loadsRepsSets.loadsRepsArray,
      },
      exCat: exercise.querySelector(`#category-${exercise.id}`).options[
        exercise.querySelector(`#category-${exercise.id}`).selectedIndex
      ].textContent,
      exType: exercise.querySelector(`#exerciseType-${exercise.id}`).options[
        exercise.querySelector(`#exerciseType-${exercise.id}`).selectedIndex
      ].textContent,
    });
  }
}
