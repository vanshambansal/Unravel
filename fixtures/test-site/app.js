const form = document.querySelector('#question-form');
const button = document.querySelector('#submit-question');
const feedback = document.querySelector('#feedback');
let submitting = false;

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submitting) return;
  const question = form.elements.question.value.trim();
  if (!question) {
    feedback.dataset.state = 'error';
    feedback.textContent = 'Enter a question before submitting.';
    form.elements.question.focus();
    return;
  }

  submitting = true;
  button.disabled = true;
  button.textContent = 'Submitting…';
  form.setAttribute('aria-busy', 'true');
  feedback.dataset.state = '';
  feedback.textContent = 'Sending your question…';
  try {
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Deliberately exclude the private test field.
      body: JSON.stringify({ question, category: form.elements.category.value }),
    });
    if (!response.ok) throw new Error('Question submission failed.');
    feedback.dataset.state = 'success';
    feedback.textContent = 'Your question was submitted successfully.';
  } catch {
    feedback.dataset.state = 'error';
    feedback.textContent = 'We could not submit your question. Your text is still here—please try again.';
  } finally {
    submitting = false;
    button.disabled = false;
    button.textContent = 'Submit question';
    form.removeAttribute('aria-busy');
  }
});

document.querySelector('#trigger-error').addEventListener('click', () => {
  throw new Error('Unravel fixture: intentional JavaScript error');
});
