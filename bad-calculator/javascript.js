/**
 * Created by Timothy on 9/18/18.
 */
//this variable will hold the value in the display paragraph
var num1 = "";
var num2 = "";
var operation = "";
var prevAnswer = "0";
var p1 = "";
var p2 = "";
var pop = "";
var maxDisplayLength = 24;
var defaultBottomDisplayValue = "-";
var Mem = "0";
function updateDisplay(override) {
    var notIn = false;
    var setTo = "";
    setTo = num1+" "+operation+" "+num2;
    if (override) {
        setTo = override.toString();
    } else {
        if (document.getElementById("output").innerHTML===""||((num1===""&&operation==="")&&num2==="")) {
            notIn = true;
        }
    }
    //var textSize = 16;//-(Math.floor(document.getElementById("output").innerHTML.length/5));
    // document.getElementById("output").style.fontSize = textSize+"px";
    if (notIn) {
        setTo = "0";
    }
    var first = setTo.length-maxDisplayLength;
    if (first<0) {
        first = 0;
    }
    document.getElementById("output").innerHTML = setTo.substring(first,setTo.length);
}
function updateDisplay2(override) {
    var notIn = false;
    var setTo = "";
    setTo = "";
    if (override) {
        setTo = override.toString();
    }
    //var textSize = 16;//-(Math.floor(document.getElementById("output").innerHTML.length/5));
    // document.getElementById("output").style.fontSize = textSize+"px";
    var first = setTo.length-maxDisplayLength;
    if (first<0) {
        first = 0;
    }
    document.getElementById("output2").innerHTML = setTo.substring(first,setTo.length);
}
function doOutput(val){
    //this function will display the values into the paragraph that is acting as the display
    if (operation==="") {
        if (num1!=="Ans"&&num1!=="Mem") {
            if (val==="."&&num1==="") {
                num1 = "0."
            } else {
                num1 = num1 + val;
            }
        }
    } else {
        if (num2!=="Ans"&&num2!=="Mem") {
            if (val==="."&&num2==="") {
                num2 = "0."
            } else {
                num2 = num2 + val;
            }
        }
    }
    updateDisplay();
    updateDisplay2(defaultBottomDisplayValue);
}
function doOperator(val){
    //if the button is an operation (+,-,/,*) then this function is called first.
    //use the opPosition to find where in the string the operator will be.
    //Then call the doOutput function passing in the val (operator)
    operation = val;
    if (num1==="") {
        if (prevAnswer==="") {
            num1 = "0"
        } else {
            num1 = "Ans";
        }
    }
    updateDisplay()
}
function calcError(stuff,stuff2) {
    num1="";
    operation="";
    num2="";
    updateDisplay(stuff);
    updateDisplay2(stuff2)
}
function cov(num) {
    if (num==="Ans") {
        return parseFloat(prevAnswer);
    } else if (num==="Mem") {
        return parseFloat(Mem);
    } else {
        if (parseFloat(num)) {
            return parseFloat(num);
        } else {
            return false
        }
    }
}
function doSet() {
    var SetTo = "";
    var n1 = cov(num1);
    if (operation==="") {
        if (prevAnswer) {
            Mem = prevAnswer.toString();
        }
    } else {
        calcError("Unable to set Memory Storage Key","No operations when setting")
    }
}
function doSpecial(val) {
    var original = cov(num1);
    var cont = true;
    if (operation!=="") {//on second
        original = cov(num2);
    }
    if (val==="squareRoot") {
        if (original>0) {
            original = Math.sqrt(original);
        } else {
            calcError("Radical","is imaginary/invalid.");
            cont = false;
        }
    } else if (val==="Answer") {
        original = "Ans"
    }  else if (val==="Mem") {
        original = "Mem"
    } else if (val==="switch") {
        if (original === 0) {
            original = "0";
        } else if (!original) {
            original = "";
        } else {
            original = original * -1;
        }
    } else if (val==="square") {
        original = Math.pow(original,2);
    }else if (val==="cube") {
        original = Math.pow(original,3);
    }else if (val==="sin") {
        original = Math.sin(original);
    }else if (val==="cos") {
        original = Math.cos(original);
    }else if (val==="tan") {
        original = Math.tan(original);
    }
    if (cont) {
        if (operation!=="") {//on second
            num2 = original.toString();
        } else {//on first
            num1 = original.toString();
        }
        updateDisplay();
    }
}
function deletee(full) {
    if (full) {
        num1 = "";
        operation = "";
        num2 = "";
    } else {
        if (operation !== "") {//on second
            if (num2==="Ans"||num2==="Mem") {
                num2 = "0";
            } else {
                if (num2!=="") {
                    num2 = num2.substring(0,num2.length-1)
                } else {
                    operation = "";
                }
            }
        } else {//on first
            if (num1==="Ans"||num1==="Mem") {
                num1 = "0";
            } else {
                num1 = num1.substring(0, num1.length - 1)
            }
        }
    }

    updateDisplay();
    updateDisplay2(defaultBottomDisplayValue)
}
function setPrev() {
    if (p1!=="") {
        if (p2!=="") {
            if (pop!=="") {
                num1 = p1;
                num2 = p2;
                operation = pop;
                updateDisplay();
            }
        }
    }
}
var onColor = -1;
function doFun() {
    var cols = ["#ff0000",
        "#ff6900",
        "#ffff00",
        "#1dff00",
        "#148d00",
        "#00fffc",
        "#1eace6",
        "#6c0073",
        "#f500ff",
        "#cccccc",
        "#000000",
    ];
    onColor = onColor+1;
    if (onColor>=cols.length) {
        onColor = 0;
    }
    var col = cols[onColor];
    document.getElementById("d1").style.backgroundColor = col;
    document.getElementById("logo").style.color = col;
    document.getElementById("hideme").style.visibility = "hidden";
}
function answer(){
    //this function will calculate the value and replace the information in the display
    //you will need to split up the value in the displayedValue variable and parseInt it.
    // Once it is split up into 2 numbers and an operation you will need a series of if elseif's to calculate the correct answer.

    //Check for invalid syntax
    var invalid = false;
    if ((num1===""&&num2==="")&&operation==="") {
        setPrev();
    }
    if (operation===""||(num1===""||num2==="")) {
        invalid = true;
    }
    if (!invalid) {
        var n1 = cov(num1);
        var n2 = cov(num2);
        var a = "";
        var aa = num1;
        var aaa = num2;
        var aaaa = operation;
        if (operation==="+") {
            a=n1+n2;
            num1="";
            operation="";
            num2="";

        } else if (operation==="-") {
            a = n1-n2;
            num1="";
            operation="";
            num2="";

        } else if (operation==="×") {
            a = n1*n2;
            num1="";
            operation="";
            num2="";

        } else if (operation==="÷") {
            if (n2!==0) {
                a=n1/n2;
                num1="";
                operation="";
                num2="";
            } else {
                calcError("Cannot divide by","0")
            }
        } else {
            calcError("No","operation");
        }
        if (a!=="") {
            updateDisplay2(a.toString());
            prevAnswer = a;
            p1 = aa;
            p2 = aaa;
            pop = aaaa;
        }
    } else {
        calcError("Invalid Syntax","Error");
    }
}
