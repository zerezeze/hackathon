// DOM Elements

const showRegistrationFormBtn = document.getElementById('showRegistrationForm');
const showMonitorListBtn = document.getElementById('showMonitorList');
const registrationForm = document.getElementById('registrationForm');
const monitorList = document.getElementById('monitorList');
const contactForm = document.getElementById('contactForm');
const monitorForm = document.getElementById('monitorForm');
const monitorListItems = document.getElementById('monitorListItems');
const searchInput = document.getElementById('searchInput');
const contactMonitorForm = document.getElementById('contactMonitorForm');
const notification = document.getElementById('notification');
const submitButton = document.getElementById('submitButton');
const cancelEditButton = document.getElementById('cancelEdit');

// Event Listeners

showRegistrationFormBtn.addEventListener('click', () => showSection(registrationForm));
showMonitorListBtn.addEventListener('click', () => showSection(monitorList));
monitorForm.addEventListener('submit', handleMonitorSubmission);
searchInput.addEventListener('input', handleSearch);
contactMonitorForm.addEventListener('submit', handleContactFormSubmission);
cancelEditButton.addEventListener('click', cancelEdit);

// Functions

function showSection(section) {
  registrationForm.classList.add('hidden');
  monitorList.classList.add('hidden');
  contactForm.classList.add('hidden');
  section.classList.remove('hidden');

  if (section === monitorList) {
    displayMonitors();
  }
}

function handleMonitorSubmission(e) {
  e.preventDefault();
  const monitorId = document.getElementById('monitorId').value;
  const name = document.getElementById('name').value;
  const discipline = document.getElementById('discipline').value;
  const subjects = document.getElementById('subjects').value;
  const schedule = document.getElementById('schedule').value;
  const contact = document.getElementById('contact').value;

  if (!name || !discipline || !subjects || !schedule || !contact) {
    showNotification('Por favor, preencha todos os campos.', 'error');
    return;
  }

  if (!contact.match(/^[0-9]{11}$/)) {
    showNotification('O número de WhatsApp deve conter 11 dígitos.', 'error');
    return;
  }

  const monitor = {
    id: monitorId || Date.now(),
    name,
    discipline,
    subjects,
    schedule,
    contact
  };
  const monitors = getMonitors();

  if (monitorId) {
    const index = monitors.findIndex((m) => m.id.toString() === monitorId);
    if (index !== -1) {
      monitors[index] = monitor;
      showNotification('Monitor atualizado com sucesso!', 'success');
    }
  } else {
    monitors.push(monitor);
    showNotification('Monitor cadastrado com sucesso!', 'success');
  }

  saveMonitors(monitors);
  monitorForm.reset();
  document.getElementById('monitorId').value = '';
  submitButton.textContent = 'Cadastrar';
  cancelEditButton.classList.add('hidden');
  showSection(monitorList);
}

function displayMonitors(filters = {}) {
  const monitors = getMonitors();
  monitorListItems.innerHTML = '';

  monitors
    .filter((monitor) => {
      return Object.keys(filters).every((key) => {
        return monitor[key].toLowerCase().includes(filters[key].toLowerCase());
      });
    })
    .forEach((monitor) => {
      const li = document.createElement('li');
      li.style.marginTop = '30px'; // Adiciona o margin-top aqui
      li.innerHTML = `
            <h3>${monitor.name}</h3>
            <p><strong>Disciplina:</strong> ${monitor.discipline}</p>
            <p><strong>Matérias:</strong> ${monitor.subjects}</p>
            <p><strong>Horários:</strong> ${monitor.schedule}</p>
            <div class="monitor-actions">
                <button class="editBtn" data-id="${monitor.id}">Editar</button>
                <button class="deleteBtn danger" data-id="${monitor.id}">Excluir</button>
                <button class="contactBtn" data-id="${monitor.id}" style="background-color: #2ecc71; color: white; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#27ae60'" onmouseout="this.style.backgroundColor='#2ecc71'">Contatar via WhatsApp</button>
            </div>
        `;
      monitorListItems.appendChild(li);
    });

  document.querySelectorAll('.editBtn').forEach((btn) => {
    btn.addEventListener('click', handleEdit);
  });

  document.querySelectorAll('.deleteBtn').forEach((btn) => {
    btn.addEventListener('click', handleDelete);
  });

  document.querySelectorAll('.contactBtn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const monitorId = e.target.getAttribute('data-id');
      showContactForm(monitorId);
    });
  });
}

function handleSearch() {
  const searchTerm = searchInput.value;
  displayMonitors({ discipline: searchTerm });
}

function showContactForm(monitorId) {
  showSection(contactForm);
  document.getElementById('contactMonitorId').value = monitorId;
}

function handleContactFormSubmission(e) {
  e.preventDefault();
  const studentName = document.getElementById('studentName').value;
  const message = document.getElementById('message').value;
  const monitorId = document.getElementById('contactMonitorId').value;

  if (!studentName || !message) {
    showNotification('Por favor, preencha todos os campos.', 'error');
    return;
  }

  const monitor = getMonitors().find((m) => m.id.toString() === monitorId);
  if (!monitor) {
    showNotification('Monitor não encontrado.', 'error');
    return;
  }

  const whatsappMessage = encodeURIComponent(`Olá ${monitor.name}, meu nome é ${studentName}. ${message}`);
  const whatsappLink = `https://wa.me/55${monitor.contact}?text=${whatsappMessage}`;

  window.open(whatsappLink, '_blank');

  contactMonitorForm.reset();
  showNotification('Redirecionando para o WhatsApp...', 'success');
  showSection(monitorList);
}

function handleEdit(e) {
  const monitorId = e.target.getAttribute('data-id');
  const monitor = getMonitors().find((m) => m.id.toString() === monitorId);

  if (monitor) {
    document.getElementById('monitorId').value = monitor.id;
    document.getElementById('name').value = monitor.name;
    document.getElementById('discipline').value = monitor.discipline;
    document.getElementById('subjects').value = monitor.subjects;
    document.getElementById('schedule').value = monitor.schedule;
    document.getElementById('contact').value = monitor.contact;

    submitButton.textContent = 'Atualizar';
    cancelEditButton.classList.remove('hidden');
    showSection(registrationForm);
  }
}

function handleDelete(e) {
  const monitorId = e.target.getAttribute('data-id');
  const monitors = getMonitors();
  const updatedMonitors = monitors.filter((m) => m.id.toString() !== monitorId);

  if (monitors.length !== updatedMonitors.length) {
    saveMonitors(updatedMonitors);
    showNotification('Monitor excluído com sucesso!', 'success');
    displayMonitors();
  } else {
    showNotification('Erro ao excluir monitor.', 'error');
  }
}

function cancelEdit() {
  monitorForm.reset();
  document.getElementById('monitorId').value = '';
  submitButton.textContent = 'Cadastrar';
  cancelEditButton.classList.add('hidden');
}

function getMonitors() {
  const monitors = localStorage.getItem('monitors');
  return monitors ? JSON.parse(monitors) : [];
}

function saveMonitors(monitors) {
  localStorage.setItem('monitors', JSON.stringify(monitors));
}

function showNotification(message, type) {
  notification.textContent = message;
  notification.className = type;
  notification.classList.remove('hidden');
  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
}

// Initial setup
displayMonitors();
