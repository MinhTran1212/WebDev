<?php
    $array = [8, 6, 7, 0, -3, -6, 9];

    //Task 1: return and output the array of even numbers
    function even($a){
        return $a % 2 == 0;
    }

    $answer = array_filter($array, "even");
    print(implode(", ", $answer));
    echo "<br>";

    //Task 2: square the array
    function square($a){
        return $a * $a;
    }

    $answer = array_map("square", $array);
    print(implode(", ", $answer));
    echo "<br>";    

    //Task 3: what is the sum of the array 
    $sum = array_reduce($array, function ($carry, $item) {
    return $carry + $item;
    }, 0);
    print($sum);
    echo "<br>";

    //Task 4: What is the average of the array
    $average = $sum / count($array);
    print($average);
    echo "<br>";
    
    //Task 5: What is the largest number in the array
    $largest = max($array);
    print($largest);
    echo "<br>";

    //Task 6: How many negative numbers are there in the array
    function negative($a){
        return $a < 0;
    }

    $answer2 = count(array_filter($array, "negative"));
    print($answer2);
    echo "<br>";

    //Task 7: What is the index of element 0 in the array
    $zeroIndex = array_search(0, $array);
    print($zeroIndex);
    echo "<br>";

    //Task 8: is there an odd number in the array (yes/no)
    function odd($a){
        return $a % 2 != 0;
    }

    $hasOdd = count(array_filter($array, "odd")) > 0;
    print($hasOdd ? "Yes" : "No");
?>