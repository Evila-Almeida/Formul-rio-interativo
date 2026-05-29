
"use strict";

const form        = document.getElementById("contactForm");
const successCard = document.getElementById("successCard");
const successName  = document.getElementById("successName");
const successEmail = document.getElementById("successEmail");
const resetBtn    = document.getElementById("resetBtn");
const submitBtn   = document.getElementById("submitBtn");
const msgTextarea = document.getElementById("message");
const msgCounter  = document.getElementById("message-counter");
const phoneInput  = document.getElementById("phone");

const fieldConfig = [
  {
    id: "fullName",
    required: true,
    validate: (val) => {
      if (!val.trim()) return "Por favor, informe seu nome completo.";
      if (val.trim().length < 3) return "O nome precisa ter pelo menos 3 caracteres.";
      if (!/^[A-Za-zÀ-ÿ\s]+$/.test(val.trim())) return "Use apenas letras e espaços no nome.";
      if (val.trim().split(/\s+/).length < 2) return "Informe pelo menos nome e sobrenome.";
      return null;
    },
  },
  {
    id: "email",
    required: true,
    validate: (val) => {
      if (!val.trim()) return "Por favor, informe seu e-mail.";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(val.trim())) return "Digite um e-mail válido (ex: nome@dominio.com).";
      return null;
    },
  },
  {
    id: "phone",
    required: false,
    validate: (val) => {
      if (!val.trim()) return null; // opcional
      const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
      if (!phoneRegex.test(val.trim())) return "Formato esperado: (92) 99999-9999";
      return null;
    },
  },
  {
    id: "subject",
    required: true,
    validate: (val) => {
      if (!val) return "Selecione um assunto para continuar.";
      return null;
    },
  },
  {
    id: "message",
    required: true,
    validate: (val) => {
      if (!val.trim()) return "Por favor, escreva sua mensagem.";
      if (val.trim().length < 10) return "A mensagem deve ter pelo menos 10 caracteres.";
      return null;
    },
  },
];


/**
 * Marca o grupo do campo como inválido e exibe a mensagem de erro.
 * @param {string} fieldId - ID do campo
 * @param {string} message - Mensagem de erro
 */
const setInvalid = (fieldId, message) => {
  const group = document.getElementById(`group-${fieldId}`);
  const errorEl = document.getElementById(`${fieldId}-error`);

  if (!group || !errorEl) return;

  group.classList.remove("is-valid");
  group.classList.add("is-invalid");
  errorEl.textContent = message;

  const input = document.getElementById(fieldId);
  if (input) input.setAttribute("aria-invalid", "true");
};

/**
 * Marca o grupo do campo como válido e limpa o erro.
 * @param {string} fieldId - ID do campo
 */
const setValid = (fieldId) => {
  const group = document.getElementById(`group-${fieldId}`);
  const errorEl = document.getElementById(`${fieldId}-error`);

  if (!group || !errorEl) return;

  group.classList.remove("is-invalid");
  group.classList.add("is-valid");
  errorEl.textContent = "";

  const input = document.getElementById(fieldId);
  if (input) input.setAttribute("aria-invalid", "false");
};

/**
 * Remove qualquer estado visual do campo.
 * @param {string} fieldId - ID do campo
 */
const clearState = (fieldId) => {
  const group = document.getElementById(`group-${fieldId}`);
  const errorEl = document.getElementById(`${fieldId}-error`);

  if (!group || !errorEl) return;

  group.classList.remove("is-valid", "is-invalid");
  errorEl.textContent = "";
};



/**
 * Valida um único campo e atualiza seu estado visual.
  @param {Object} config - Configuração do campo
 * @returns {boolean} true se válido
 */
const validateField = (config) => {
  const input = document.getElementById(config.id);
  if (!input) return true;

  const value = input.value;
  const error = config.validate(value);

  if (error) {
    setInvalid(config.id, error);
    return false;
  } else {
    // Campos opcionais vazios ficam neutros (sem ícone verde)
    if (!config.required && !value.trim()) {
      clearState(config.id);
    } else {
      setValid(config.id);
    }
    return true;
  }
};

const validateTerms = () => {
  const checkbox = document.getElementById("terms");
  const group    = document.getElementById("group-terms");
  const errorEl  = document.getElementById("terms-error");

  if (!checkbox.checked) {
    group.classList.add("is-invalid");
    errorEl.textContent = "Você precisa aceitar os termos para continuar.";
    checkbox.setAttribute("aria-invalid", "true");
    return false;
  }

  group.classList.remove("is-invalid");
  errorEl.textContent = "";
  checkbox.setAttribute("aria-invalid", "false");
  return true;
};

const validateForm = () => {
  let isValid = true;
  let firstInvalidField = null;

  fieldConfig.forEach((config) => {
    const fieldOk = validateField(config);
    if (!fieldOk && !firstInvalidField) {
      firstInvalidField = document.getElementById(config.id);
    }
    isValid = isValid && fieldOk;
  });

  const termsOk = validateTerms();
  if (!termsOk && !firstInvalidField) {
    firstInvalidField = document.getElementById("terms");
  }
  isValid = isValid && termsOk;

  if (firstInvalidField) {
    firstInvalidField.focus();
  }

  return isValid;
};


const applyPhoneMask = (value) => {
 
  const digits = value.replace(/\D/g, "");

  if (digits.length <= 2)  return `(${digits}`;
  if (digits.length <= 6)  return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
};

phoneInput.addEventListener("input", (e) => {
  const masked = applyPhoneMask(e.target.value);
  e.target.value = masked;
});

msgTextarea.addEventListener("input", () => {
  const count = msgTextarea.value.length;
  const max   = parseInt(msgTextarea.getAttribute("maxlength"), 10);

  msgCounter.textContent = `${count} / ${max}`;
  msgCounter.classList.remove("near-limit", "at-limit");

  if (count >= max) {
    msgCounter.classList.add("at-limit");
  } else if (count >= max * 0.8) {
    msgCounter.classList.add("near-limit");
  }
});

fieldConfig.forEach((config) => {
  const input = document.getElementById(config.id);
  if (!input) return;

  input.addEventListener("blur", () => {
    validateField(config);
  });

  input.addEventListener("input", () => {
    const group = document.getElementById(`group-${config.id}`);
    if (group && group.classList.contains("is-invalid")) {
      validateField(config);
    }
  });
});

document.getElementById("terms").addEventListener("change", () => {
  const group = document.getElementById("group-terms");
  if (group.classList.contains("is-invalid")) {
    validateTerms();
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const isValid = validateForm();
  if (!isValid) return;

  submitBtn.classList.add("is-loading");
  submitBtn.querySelector(".btn-submit__text").textContent = "Enviando...";

  await new Promise((resolve) => setTimeout(resolve, 1200));

  const nameVal  = document.getElementById("fullName").value.trim();
  const emailVal = document.getElementById("email").value.trim();

  const firstName = nameVal.split(" ")[0];

  successName.textContent  = firstName;
  successEmail.textContent = emailVal;

  form.hidden = true;
  successCard.hidden = false;
  successCard.setAttribute("aria-hidden", "false");
  successCard.focus();
});

resetBtn.addEventListener("click", () => {
  form.reset();

  fieldConfig.forEach((config) => clearState(config.id));

  const termsGroup = document.getElementById("group-terms");
  const termsError = document.getElementById("terms-error");
  if (termsGroup) termsGroup.classList.remove("is-invalid");
  if (termsError) termsError.textContent = "";

  msgCounter.textContent = "0 / 500";
  msgCounter.classList.remove("near-limit", "at-limit");

  submitBtn.classList.remove("is-loading");
  
  successCard.hidden = true;
  successCard.setAttribute("aria-hidden", "true");
  form.hidden = false;

  document.getElementById("fullName").focus();
});
