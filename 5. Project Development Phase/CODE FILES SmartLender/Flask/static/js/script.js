document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const form = document.getElementById('loanForm');
    const progressBar = document.getElementById('formProgressBar');
    const burdenMeter = document.getElementById('burdenMeter');
    const liveHint = document.getElementById('liveHint');
    const themeToggle = document.getElementById('themeToggle');
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const loadDraftBtn = document.getElementById('loadDraftBtn');
    const presetButtons = document.querySelectorAll('.preset-btn');
    const storageKey = 'smartLenderDraftV1';

    const themeKey = 'smartLenderTheme';
    const savedTheme = localStorage.getItem(themeKey);
    if (savedTheme === 'light') {
        body.setAttribute('data-theme', 'light');
    }

    if (themeToggle) {
        const updateThemeButtonText = () => {
            const isLight = body.getAttribute('data-theme') === 'light';
            themeToggle.textContent = isLight ? '☀️ Light' : '🌙 Dark';
        };

        themeToggle.addEventListener('click', () => {
            const isLight = body.getAttribute('data-theme') === 'light';
            if (isLight) {
                body.removeAttribute('data-theme');
                localStorage.setItem(themeKey, 'dark');
            } else {
                body.setAttribute('data-theme', 'light');
                localStorage.setItem(themeKey, 'light');
            }
            updateThemeButtonText();
        });

        updateThemeButtonText();
    }

    if (!form) {
        return;
    }

    const allInputs = Array.from(form.querySelectorAll('input, select'));

    const getNumericValue = (id) => {
        const element = document.getElementById(id);
        if (!element || element.value === '') {
            return 0;
        }
        return Number(element.value);
    };

    const updateProgress = () => {
        const requiredFields = allInputs.filter((el) => el.hasAttribute('required'));
        const filled = requiredFields.filter((el) => String(el.value).trim() !== '').length;
        const pct = Math.round((filled / requiredFields.length) * 100);
        if (progressBar) {
            progressBar.style.width = `${pct}%`;
            progressBar.textContent = `${pct}%`;
        }
    };

    const updateBurden = () => {
        if (!burdenMeter) {
            return;
        }
        const income = getNumericValue('ApplicantIncome') + getNumericValue('CoapplicantIncome');
        const loanAmount = getNumericValue('LoanAmount') * 1000;
        if (income <= 0 || loanAmount <= 0) {
            burdenMeter.textContent = 'N/A';
            return;
        }
        const ratio = (loanAmount / (income * 12)) * 100;
        burdenMeter.textContent = `${ratio.toFixed(1)}% annual burden`;
    };

    const updateLiveHint = () => {
        if (!liveHint) {
            return;
        }
        const credit = getNumericValue('Credit_History');
        const totalIncome = getNumericValue('ApplicantIncome') + getNumericValue('CoapplicantIncome');
        const loanAmt = getNumericValue('LoanAmount');

        if (credit === 1 && totalIncome >= 4000 && loanAmt > 0 && loanAmt <= 180) {
            liveHint.textContent = 'Profile signal looks stronger: likely lower credit risk characteristics.';
            return;
        }
        if (credit === 0 && loanAmt >= 220) {
            liveHint.textContent = 'Profile signal indicates caution: weaker credit history with high loan amount.';
            return;
        }
        liveHint.textContent = 'Fill all required fields to enable a high-confidence prediction.';
    };

    const collectFormData = () => {
        const data = {};
        allInputs.forEach((el) => {
            data[el.name] = el.value;
        });
        return data;
    };

    const loadFormData = (data) => {
        allInputs.forEach((el) => {
            if (Object.prototype.hasOwnProperty.call(data, el.name)) {
                el.value = data[el.name];
            }
        });
        updateProgress();
        updateBurden();
        updateLiveHint();
    };

    const presets = {
        low: {
            Gender: '1',
            Married: '1',
            Dependents: '1',
            Education: '0',
            Self_Employed: '0',
            ApplicantIncome: '6500',
            CoapplicantIncome: '1700',
            LoanAmount: '120',
            Loan_Amount_Term: '360',
            Credit_History: '1.0',
            Property_Area: '2',
        },
        high: {
            Gender: '0',
            Married: '0',
            Dependents: '3',
            Education: '1',
            Self_Employed: '1',
            ApplicantIncome: '1400',
            CoapplicantIncome: '0',
            LoanAmount: '280',
            Loan_Amount_Term: '360',
            Credit_History: '0.0',
            Property_Area: '0',
        },
        clear: {
            Gender: '',
            Married: '',
            Dependents: '',
            Education: '',
            Self_Employed: '',
            ApplicantIncome: '',
            CoapplicantIncome: '',
            LoanAmount: '',
            Loan_Amount_Term: '',
            Credit_History: '',
            Property_Area: '',
        },
    };

    presetButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const preset = presets[btn.dataset.preset];
            if (preset) {
                loadFormData(preset);
            }
        });
    });

    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', () => {
            localStorage.setItem(storageKey, JSON.stringify(collectFormData()));
            if (liveHint) {
                liveHint.textContent = 'Draft saved in this browser.';
            }
        });
    }

    if (loadDraftBtn) {
        loadDraftBtn.addEventListener('click', () => {
            const saved = localStorage.getItem(storageKey);
            if (!saved) {
                if (liveHint) {
                    liveHint.textContent = 'No saved draft found yet.';
                }
                return;
            }
            try {
                loadFormData(JSON.parse(saved));
                if (liveHint) {
                    liveHint.textContent = 'Draft restored successfully.';
                }
            } catch (e) {
                if (liveHint) {
                    liveHint.textContent = 'Saved draft could not be loaded.';
                }
            }
        });
    }

    allInputs.forEach((el) => {
        el.addEventListener('input', () => {
            updateProgress();
            updateBurden();
            updateLiveHint();
        });
        el.addEventListener('change', () => {
            updateProgress();
            updateBurden();
            updateLiveHint();
        });
    });

    form.addEventListener('submit', (event) => {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }
        form.classList.add('was-validated');
    }, false);

    updateProgress();
    updateBurden();
    updateLiveHint();
});
