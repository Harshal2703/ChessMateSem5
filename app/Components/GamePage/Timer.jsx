import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ initialTime, isPaused}) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  useEffect(() => {
    let timer;
    console.log(initialTime, isPaused)
    if (!isPaused) {
      timer = setInterval(() => {
        if (timeRemaining > 0) {
          setTimeRemaining(timeRemaining - 1);
        } else {
          clearInterval(timer);
          // Perform an action when the timer reaches 0, e.g., show a message or call a function
          // You can add your custom logic here.
        }
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [timeRemaining, isPaused]);

  return (
    <div>
      <h1>Countdown Timer</h1>
      <p>Time Remaining: {timeRemaining} seconds</p>
    </div>
  );
}