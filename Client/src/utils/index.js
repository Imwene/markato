export const generateCaptcha = () => {
  // Generate simple addition problems with answers > 0
  const num1 = Math.floor(Math.random() * 9) + 1; // 1-9
  const num2 = Math.floor(Math.random() * 9) + 1; // 1-9

  const answer = num1 + num2;

  return {
    question: `What is ${num1} + ${num2}?`,
    answer: answer.toString(),
  };
};
