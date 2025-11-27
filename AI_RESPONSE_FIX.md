# Fix for Auto AI Response on Mood Save

## Problem
The web app doesn't automatically send mood + reflection to AI like the desktop app does.

## Solution
Find this code in `dashboard.html` (around line 361-381):

```javascript
document.getElementById('moodForm').onsubmit = async function (e) {
    e.preventDefault();

    if (!selectedMood) {
        alert('Please select a mood!');
        return;
    }

    const intensity = document.getElementById('intensity').value;
    const reflection = document.getElementById('reflection').value;

    try {
        await moods.save(selectedDate.year, selectedDate.month, selectedDate.day,
            selectedMood, parseInt(intensity), reflection);
        closeMoodModal();
        loadCalendar();
        alert('✅ Mood saved successfully!');
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
};
```

## Replace with this:

```javascript
document.getElementById('moodForm').onsubmit = async function (e) {
    e.preventDefault();

    if (!selectedMood) {
        alert('Please select a mood!');
        return;
    }

    const intensity = document.getElementById('intensity').value;
    const reflection = document.getElementById('reflection').value;

    try {
        // Save the mood
        await moods.save(selectedDate.year, selectedDate.month, selectedDate.day,
            selectedMood, parseInt(intensity), reflection);
        
        closeMoodModal();
        loadCalendar();
        
        // Automatically send to AI (matching desktop app behavior)
        const aiMessage = `I felt ${selectedMood} today with intensity ${intensity}/10. ${reflection}`;
        
        // Open AI chat modal
        showAIChat();
        
        // Add user message to chat
        addChatMessage(aiMessage, 'user');
        
        // Get AI response
        try {
            const response = await ai.chat(aiMessage);
            addChatMessage(response.response, 'ai');
        } catch (error) {
            addChatMessage('Sorry, I encountered an error getting AI response.', 'ai');
        }
        
        alert('✅ Mood saved! Check AI chat for response.');
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
};
```

## What This Does:
1. Saves the mood as before
2. Creates a message: "I felt [mood] today with intensity [X]/10. [reflection]"
3. Opens the AI chat modal automatically
4. Sends the message to Gemini AI
5. Displays the AI's response

This matches exactly how the desktop app works in `main.py` line 1207!
