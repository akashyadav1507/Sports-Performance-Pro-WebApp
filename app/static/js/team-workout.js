"use strict";
const team_node = document.querySelectorAll(".team-nodes");
const btnCloseModal = document.querySelector(".close-modal");
const btnshowModal = document.querySelectorAll(".show-modal"); //
const block_nodes = document.querySelectorAll(".block_nodes");
const exercise_nodes = document.querySelectorAll(".exc_nodes");

// Add click event listeners to tree nodes
team_node.forEach((t) =>
  t.addEventListener("click", (e) => {
    const target = e.target;
    // console.log(`Outer Target:`,target)

    let vis_ = target.getAttribute("visibility");
    console.log(vis_);

    // BLOCK node clicked
    if (target.classList.contains("block-nodes")) {
      console.log("Entered is the block function");
      console.log(`Inner Target:`, target);
      let vis_ = target.getAttribute("visibility");
      console.log(vis_);
      if (Number(vis_) === 0) {
        // Expand Tree
        console.log("Entered function ");
        // console.log(target)
        const exc_nodes = target.querySelectorAll(".exc_nodes");
        console.log(exc_nodes);
        exc_nodes.forEach((ex) => ex.classList.remove(["hidden"]));
        target.setAttribute("visibility", 1);
      } else {
        // Shrink Tree
        const exc_nodes = target.querySelectorAll(".exc_nodes");
        console.log(exc_nodes);
        exc_nodes.forEach((t) => t.classList.add(["hidden"]));
        target.setAttribute("visibility", 0);
      }
    }
    // TEAM/ATHLETE Name is clicked
    else {
      if (Number(vis_) === 0) {
        // Expand Tree
        console.log("Entered Parent Team function ");
        // console.log(target)
        const block_nodes = target.querySelectorAll(".block-nodes");
        console.log(block_nodes);
        block_nodes.forEach((t) => t.classList.remove(["hidden"]));
        target.setAttribute("visibility", 1);
        console.log(target.querySelectorAll(".block-nodes"));
        console.log(target);
        //
      } else {
        // Shrink Tree : NOTE while shrinking Tree, both the block and exec should become hidden
        console.log(e.target);
        const block_nodes = target.querySelectorAll(".block-nodes");
        console.log(block_nodes);
        block_nodes.forEach((t) => {
          //   console.log("EXEC NODES TO BE PRINTED");
          //   t.classList.add(["hidden"]);
          //console.log(t.querySelectorAll(".exc_nodes"));
          t.querySelectorAll(".exc_nodes").forEach((x) =>
            x.classList.add(["hidden"])
          );
          block_nodes.forEach((t) => t.classList.add(["hidden"]));
          target.setAttribute("visibility", 0);
        });
      }
    }
  })
);

// When Closing the Team click , Refactor as above to have single event handler. Used class to change functionaloty. Might need refactoring further for DRY principle.

// Blocks visibility should become 0
// Execs visibility should become 0

// Testing SEPEARATE block : USE delegation above instead Bubbling up
// block_nodes.forEach(block => block.addEventListener("click", (e) => {
//     const target = e.target;
//     // console.log(`Target:`,target)
//     if (e.target.classList.contains('.block-nodes'))
//     {
//         console.log("This is the block function")
//     let vis_ =  target.getAttribute('visibility');
//     console.log(vis_);
//      if (Number(vis_) === 0)
//      {
//     console.log("Entered function ")
//     // console.log(target)
//     const exc_nodes = target.querySelectorAll('.exc_nodes');
//     console.log(exc_nodes)
//     exc_nodes.forEach(t => t.classList.remove(['hidden']));
//     target.setAttribute('visibility', 1);

//      }
//      else {
//         const exc_nodes = target.querySelectorAll('.exc_nodes');
//     console.log(exc_nodes)
//     exc_nodes.forEach(t => t.classList.add(['hidden']));
//     target.setAttribute('visibility', 0);
//      }
// }}));

// JavaScript for team/Athlete search
document.getElementById("team-search").addEventListener("keyup", function () {
  const searchText = this.value.toLowerCase();
  //console.log(searchText);
  const teamList = document.querySelectorAll(".team-nodes");
  //console.log(teamList);
  teamList.forEach(function (team) {
    //console.log(team);
    const teamName = team.outerText.toLowerCase();
    //console.log(teamName);
    if (teamName.includes(searchText)) {
      team.style.display = "";
    } else {
      team.style.display = "none";
    }
  });
});

// // JavaScript for athlete search If needed:

// document.getElementById("athlete-search").addEventListener("keyup", function () {
//     const searchText = this.value.toLowerCase();
//     console.log(searchText);
//     const teamList = document.querySelectorAll(".team-nodes");
//     //console.log(teamList);
//     teamList.forEach(function (team) {
//       console.log(team);
//       const teamName = team.outerText.toLowerCase();
//       console.log(teamName);
//       if (teamName.includes(searchText)) {
//         team.style.display = "";
//       } else {
//         team.style.display = "none";
//       }
//     });
//   });
