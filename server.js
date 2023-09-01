const express = require("express");
const app = express();

const MAX_HISTORY_LENGTH = 20;
const history = [];

function convertLinkToExpression(link) {
  const operators = {
    plus: "+",
    minus: "-",
    times: "*",
    divide: "/",
    power: "**",
    mod: "%",
  };

  const expression = link
    .split("/")
    .map((part) => {
      if (operators.hasOwnProperty(part)) {
        return operators[part];
      } else if (!isNaN(parseFloat(part))) {
        return part;
      } else {
        throw new Error(`Invalid part in the link: ${part}`);
      }
    })
    .join("");

  return expression;
}

function evaluateExpression(expression) {
  try {
    return eval(expression);
  } catch (error) {
    throw new Error(`Error evaluating expression: ${error.message}`);
  }
}

app.get("/history", (req, res) => {
  const historyText = history
    .map((item, index) => `${index + 1}. ${item.link} = ${item.result}`)
    .join("\n");
  res.send(`History:\n${historyText}`);
});
app.get("/:link*", (req, res) => {
  const encodedLink = req.params.link + (req.params[0] || "");
  const link = decodeURIComponent(encodedLink);

  try {
    const result = convertLinkToExpression(link);
    const evaluatedResult = evaluateExpression(result);

    // Add the operation to history
    history.unshift({ link, result: evaluatedResult });
    if (history.length > MAX_HISTORY_LENGTH) {
      history.pop();
    }

    res.send(`Link: ${link}\nResult: ${evaluatedResult}`);
  } catch (error) {
    res.status(400).send(`Error: ${error.message}`);
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
