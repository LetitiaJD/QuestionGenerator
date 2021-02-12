$(document).ready(function() {
    const questions = [];
    let selectedQuestionId = null;

    function fillForm(saveQuest, quest = "", corAns = "", incAns = "", diff = 1, selQuestId = null) {
        $("#saveQuestion").text(saveQuest);
        $("#question").val(quest);
        $("#correctAnswer").val(corAns);
        $("#incorrectAnswers").val(incAns);
        $("#difficulty").val(diff);
        selectedQuestionId = selQuestId;
    }

    function questionToHtml(q, idx) {
        let str = '<li id="';
        str += idx;
        str += '" class="list-group-item d-flex justify-content-between lh-condensed">';
        str += '<div><h6 class="my-0">';
        if (q.question.startsWith('<img')) {
            str += q.question.split('src="img/').pop().split('.jpg"')[0]; // returns 'two'
        } else {
            str += q.question;
        }
        str += '</h6>';
        str += '<small class="text-muted">';
        str += q.answers[0];
        str += '</small></div>';
        if (q.points === 1) {
            str += '<span class="text-success">Easy</span>';
        } else if (q.points === 2) {
            str += '<span class="text-warning">Medium</span>';
        } else if (q.points === 3) {
            str += '<span class="text-danger">Hard</span>';
        }
        str += '</li>';
        return str;
    }

    function resetQuestionList() {
        $("#questionList").empty();
    }

    function addQuestion(q) {
        let str = questionToHtml(q, questions.length);
        $("#questionList").prepend(str);
    }

    function editQuestion(q) {
        let str = questionToHtml(q, selectedQuestionId);
        $("#" + selectedQuestionId).replaceWith(str);
        //$("#" + selectedQuestionId).css('background-color', 'red');
    }

    $("form").submit(function(e){
        e.preventDefault();
    });

    $("#questionList").on("click", "li", function() {
        //alert("Clicked list." + $(this).attr("id"));
        selectedQuestionId = $(this).attr("id");
        console.log($(this).attr("id"));
        $("#question").val(questions[selectedQuestionId].question);
        $("#correctAnswer").val(questions[selectedQuestionId].answers[0]);
        $("#incorrectAnswers").val(questions[selectedQuestionId].answers.slice(1).join("\n"));
        $("#difficulty").val(questions[selectedQuestionId].points);
        //$("#timeMultiplier").val(questions[selectedQuestionId].question); // Not implemented yet
        $("#saveQuestion").text("Save changes");
    });

    $("#fileInput").change(function() {
        var file = fileInput;
        var reader = new FileReader();

        reader.onload = function(e) {
            fileContent = reader.result;
            var loadedQuestions = JSON.parse(fileContent)['questions'];
            resetQuestionList();
            loadedQuestions.forEach(function(q) {
                addQuestion(q);
                questions.push(q);
            });
        }
        reader.readAsText(file.files[0]);
    });

    $("#saveQuestion").click(function() {
        let valid = true;
        let questionField = $("#question").val();
        let correctAnsField = $("#correctAnswer").val();
        let incorrectAnsField = $("#incorrectAnswers").val();
        let difficultyField = $("#difficulty").val();
        let timeMultiplierField = $("#timeMultiplier").val();

        // Verify form content
        if (!questionField) {
            $("#question").addClass("is-invalid");
            valid = false;
        }
        if (!correctAnsField) {
            $("#correctAnswer").addClass("is-invalid");
            valid = false;
        }
        if (!incorrectAnsField) {
            $("#incorrectAnswers").addClass("is-invalid");
            valid = false;
        }

        let incorrectAnswers = $.map(incorrectAnsField.split(/\r?\n/), $.trim);
        const parsedIncorrectAns = incorrectAnswers.filter(answer => answer.length > 0);

        let question = {
            question: questionField,
            answers: $.merge([correctAnsField], parsedIncorrectAns),
            points: parseInt(difficultyField)
        }

        if (valid) {
            if (selectedQuestionId == null) {
                addQuestion(question);
                questions.push(question);
            } else {
                questions[selectedQuestionId] = question;
                // Update overview of question on the right
                editQuestion(question);
            }
            console.log(JSON.stringify(questions));
        }

        // Restore form
        fillForm("Save question");
    });

    $("#newQuestion").click( function() {
        fillForm("Save question");
    });

    function requestFileName() {
        var fileName = 'quiz.json';
        var input = prompt('Please enter the file name:', fileName);

        if (input != null) {
            fileName = input.split('.')[0] + '.json';
        }

        return fileName;
    }

    $("#generateFile").click( function () {
        let questionsArray = {
            "questions" : questions
        }

        var blob = new Blob( [ JSON.stringify(questionsArray) ], {
            type: 'application/octet-stream'
        });

        url = URL.createObjectURL( blob );
        var link = document.createElement( 'a' );
        link.setAttribute( 'href', url );
        link.setAttribute( 'download', requestFileName());

        var event = document.createEvent( 'MouseEvents' );
        event.initMouseEvent( 'click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        link.dispatchEvent( event );
    });
});

