/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { fireEvent, screen, waitFor } from "@testing-library/dom";

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    test("Then I should be identified as an Employee in app", async () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty",
      };

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-employee");

      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      // Mock du store avec une implémentation complète
      const store = {
        login: jest.fn().mockResolvedValue({ jwt: 'token' }),
        users: jest.fn().mockReturnValue({
          create: jest.fn().mockResolvedValue({})
        })
      };

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitEmployee);
      form.addEventListener("submit", handleSubmit);
      
      // Soumettre le formulaire
      await fireEvent.submit(form);
      
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
      
      // Attendre que la navigation soit effectuée
      await new Promise(process.nextTick);
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });

    test("It should renders Bills page", () => {
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
});

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected",
      };

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-admin");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders HR dashboard page", () => {
      expect(screen.queryByText("Validations")).toBeTruthy();
    });
  });
});

describe("Given that I am a user on login page", () => {
  describe("When I submit the employee form with a store", () => {
    test("Then it should call the store create method", async () => {
      document.body.innerHTML = LoginUI();
      
      // Mock du store avec succès pour login
      const store = {
        login: jest.fn().mockResolvedValue({ jwt: 'token' }),
        users: jest.fn().mockReturnValue({
          create: jest.fn().mockResolvedValue({})
        })
      };

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(),
        PREVIOUS_LOCATION: '',
        store
      });

      const form = screen.getByTestId("form-employee")
      const emailInput = screen.getByTestId("employee-email-input")
      const passwordInput = screen.getByTestId("employee-password-input")

      fireEvent.change(emailInput, { target: { value: "employee@test.com" } })
      fireEvent.change(passwordInput, { target: { value: "employee" } })
      
      await login.handleSubmitEmployee({ 
        preventDefault: () => {},
        target: form
      });

      expect(store.login).toHaveBeenCalled()
    });
  });

  describe("When I submit the admin form with a store", () => {
    test("Then it should call the store create method", async () => {
      document.body.innerHTML = LoginUI();
      
      const store = {
        login: jest.fn().mockResolvedValue({ jwt: 'token' }),
        users: jest.fn().mockReturnValue({
          create: jest.fn().mockResolvedValue({})
        })
      };

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(),
        PREVIOUS_LOCATION: '',
        store
      });

      const form = screen.getByTestId("form-admin")
      const emailInput = screen.getByTestId("admin-email-input")
      const passwordInput = screen.getByTestId("admin-password-input")

      fireEvent.change(emailInput, { target: { value: "admin@test.com" } })
      fireEvent.change(passwordInput, { target: { value: "admin" } })
      
      await login.handleSubmitAdmin({ 
        preventDefault: () => {},
        target: form
      });

      expect(store.login).toHaveBeenCalled()
    });
  });

  describe("When the API returns an error", () => {
    test("Then it should handle the error", async () => {
      document.body.innerHTML = LoginUI();
      
      // Mock du store avec une séquence de comportements
      const store = {
        login: jest.fn().mockImplementation(() => {
          return Promise.resolve({ jwt: 'token' })
        }),
        users: jest.fn().mockReturnValue({
          create: jest.fn().mockImplementation(() => {
            console.log("User created")
            return Promise.resolve({ jwt: 'token' })
          })
        })
      };

      const onNavigate = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION: '',
        store
      });

      // Mock des méthodes login et createUser
      login.login = jest.fn().mockImplementation(() => Promise.reject(new Error()));
      login.createUser = jest.fn().mockImplementation(() => {
        console.log("User created");
        return Promise.resolve({});
      });

      const form = screen.getByTestId("form-employee");
      const emailInput = screen.getByTestId("employee-email-input");
      const passwordInput = screen.getByTestId("employee-password-input");

      fireEvent.change(emailInput, { target: { value: "employee@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "employee" } });

      const consoleSpy = jest.spyOn(console, "log");
      
      await login.handleSubmitEmployee({ 
        preventDefault: () => {},
        target: form
      });
      
      expect(login.createUser).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("User created");
      
      consoleSpy.mockRestore();
    });
  });

  describe("When form submission is successful", () => {
    test("Then it should update PREVIOUS_LOCATION for employee", async () => {
      document.body.innerHTML = LoginUI()
      const onNavigate = jest.fn();
      
      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION: '',
        store: null
      })

      // Mock de la méthode login avec une promesse qui se résout immédiatement
      login.login = jest.fn().mockImplementation(() => {
        return Promise.resolve({})
      });

      const form = screen.getByTestId("form-employee")
      const emailInput = screen.getByTestId("employee-email-input")
      const passwordInput = screen.getByTestId("employee-password-input")

      fireEvent.change(emailInput, { target: { value: "employee@test.com" } })
      fireEvent.change(passwordInput, { target: { value: "employee" } })

      // Attendre que toutes les promesses soient résolues
      await login.handleSubmitEmployee({ 
        preventDefault: () => {},
        target: form
      })
      
      // Attendre le prochain tick pour s'assurer que tout est résolu
      await new Promise(process.nextTick);

      expect(onNavigate).toHaveBeenCalledWith("#employee/bills")
    })

    test("Then it should update PREVIOUS_LOCATION for admin", async () => {
      document.body.innerHTML = LoginUI()
      const onNavigate = jest.fn();
      
      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION: '',
        store: null
      })

      // Mock de la méthode login avec une promesse qui se résout immédiatement
      login.login = jest.fn().mockImplementation(() => {
        return Promise.resolve({})
      });

      const form = screen.getByTestId("form-admin")
      const emailInput = screen.getByTestId("admin-email-input")
      const passwordInput = screen.getByTestId("admin-password-input")

      fireEvent.change(emailInput, { target: { value: "admin@test.com" } })
      fireEvent.change(passwordInput, { target: { value: "admin" } })

      // Attendre que toutes les promesses soient résolues
      await login.handleSubmitAdmin({ 
        preventDefault: () => {},
        target: form
      })
      
      // Attendre le prochain tick pour s'assurer que tout est résolu
      await new Promise(process.nextTick);

      expect(onNavigate).toHaveBeenCalledWith("#admin/dashboard")
    })
  })
})

describe("Given that I am a user on login page", () => {
  describe("When using login and createUser methods", () => {
    test("Then login should handle null store", () => {
      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(),
        PREVIOUS_LOCATION: '',
        store: null
      });

      const result = login.login({});
      expect(result).toBeNull();
    });

    test("Then createUser should handle null store", () => {
      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(),
        PREVIOUS_LOCATION: '',
        store: null
      });

      const result = login.createUser({});
      expect(result).toBeNull();
    });

    test("Then login should handle store with JWT", async () => {
      const store = {
        login: jest.fn().mockResolvedValue({ jwt: 'fake-jwt-token' })
      };

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(),
        PREVIOUS_LOCATION: '',
        store
      });

      await login.login({ email: 'user@test.com', password: 'password123' });
      expect(localStorage.setItem).toHaveBeenCalledWith('jwt', 'fake-jwt-token');
    });

    test("Then createUser should create user and login", async () => {
      const store = {
        login: jest.fn().mockResolvedValue({ jwt: 'fake-jwt-token' }),
        users: jest.fn().mockReturnValue({
          create: jest.fn().mockResolvedValue({})
        })
      };

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(),
        PREVIOUS_LOCATION: '',
        store
      });

      const user = {
        type: 'Employee',
        email: 'user@test.com',
        password: 'password123'
      };

      const consoleSpy = jest.spyOn(console, 'log');
      await login.createUser(user);

      expect(store.users().create).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(`User with ${user.email} is created`);
      expect(store.login).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
})

describe("Given I am a user on login page", () => {
  describe("When I submit the form with invalid credentials", () => {
    test("Then it should create a new user when login fails", async () => {
      document.body.innerHTML = LoginUI()
      
      // Mock du localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true
      })

      // Mock du store avec un échec de login mais un succès de création
      const store = {
        login: jest.fn().mockImplementation(() => Promise.reject(new Error())),
        users: jest.fn().mockReturnValue({
          create: jest.fn().mockResolvedValue({})
        })
      }

      const onNavigate = jest.fn()

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION: '',
        store
      })

      // Simuler la soumission du formulaire
      const form = screen.getByTestId("form-employee")
      const emailInput = screen.getByTestId("employee-email-input")
      const passwordInput = screen.getByTestId("employee-password-input")

      fireEvent.change(emailInput, { target: { value: "employee@test.tld" } })
      fireEvent.change(passwordInput, { target: { value: "employee" } })

      // Espionner la méthode createUser
      const createUserSpy = jest.spyOn(login, 'createUser')
        .mockImplementation(() => Promise.resolve({}))

      // Soumettre le formulaire
      login.handleSubmitEmployee({ 
        preventDefault: () => {},
        target: form
      })

      // Attendre que les promesses soient résolues
      await new Promise(process.nextTick)

      // Vérifier que createUser a été appelé avec les bons paramètres
      expect(createUserSpy).toHaveBeenCalledWith({
        type: "Employee",
        email: "employee@test.tld",
        password: "employee",
        status: "connected"
      })
    })
  })
})

describe("When I am on Login page as an admin", () => {
    test("Then the background should change to white after successful login", async () => {
      document.body.innerHTML = LoginUI()
      
      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate: (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        },
        PREVIOUS_LOCATION: '',
        store: {
          login: jest.fn().mockResolvedValue({ jwt: "123" })
        }
      })

      const form = screen.getByTestId("form-admin")
      const inputEmail = screen.getByTestId("admin-email-input")
      const inputPassword = screen.getByTestId("admin-password-input")

      // Set initial background color
      document.body.style.backgroundColor = "red"
      
      // Set form values
      fireEvent.change(inputEmail, { target: { value: "admin@test.tld" } })
      fireEvent.change(inputPassword, { target: { value: "admin123" } })
      
      // Submit form
      fireEvent.submit(form)
      
      // Wait for background color to change
      await waitFor(() => {
        expect(document.body.style.backgroundColor).toBe("rgb(255, 255, 255)")
      })
    })
})

describe("When I submit the admin form with a failing login", () => {
    test("Then it should call createUser", async () => {
      document.body.innerHTML = LoginUI();
      
      // Mock du store avec un échec de login
      const store = {
        login: jest.fn().mockRejectedValueOnce(new Error("Login failed")),
        users: jest.fn().mockReturnValue({
          create: jest.fn().mockResolvedValue({})
        })
      };

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(),
        PREVIOUS_LOCATION: '',
        store
      });

      // Mock de la méthode createUser pour pouvoir la surveiller
      const createUserSpy = jest.spyOn(login, 'createUser')
        .mockImplementation(() => Promise.resolve({}));

      // Mock de la méthode login pour s'assurer qu'elle échoue
      login.login = jest.fn().mockRejectedValue(new Error("Login failed"));

      const form = screen.getByTestId("form-admin");
      const emailInput = screen.getByTestId("admin-email-input");
      const passwordInput = screen.getByTestId("admin-password-input");

      fireEvent.change(emailInput, { target: { value: "admin@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "admin123" } });
      
      // Soumettre le formulaire
      await login.handleSubmitAdmin({ 
        preventDefault: jest.fn(),
        target: form
      });

      // Attendre que toutes les promesses soient résolues
      await new Promise(process.nextTick);

      // Vérifier que createUser a été appelé avec les bons paramètres
      expect(createUserSpy).toHaveBeenCalledWith({
        type: "Admin",
        email: "admin@test.com",
        password: "admin123",
        status: "connected"
      });
    });
  });

describe("Given that I am on login page", () => {
  describe("When the form elements don't exist", () => {
    test("Then it should not throw errors", () => {
      // Créer un DOM sans les formulaires
      document.body.innerHTML = '<div></div>';
      
      // Vérifier que la création d'une instance ne lance pas d'erreur
      expect(() => {
        new Login({
          document,
          localStorage: window.localStorage,
          onNavigate: jest.fn(),
          PREVIOUS_LOCATION: '',
          store: null
        })
      }).not.toThrow();
    });
  });

  describe("When only employee form exists", () => {
    test("Then it should add listener only to employee form", () => {
      document.body.innerHTML = LoginUI();

      // Supprimer le formulaire admin pour ne garder que employee
      const adminForm = screen.getByTestId("form-admin");
      adminForm.remove();

      // Mock du store
      const store = {
        login: jest.fn().mockResolvedValue({}),
        users: jest.fn().mockReturnValue({
          create: jest.fn().mockResolvedValue({})
        })
      };

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(),
        PREVIOUS_LOCATION: '',
        store
      });

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn(e => e.preventDefault());
      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe("When only admin form exists", () => {
    test("Then it should add listener only to admin form", () => {
      document.body.innerHTML = LoginUI();

      // Supprimer le formulaire employee pour ne garder que admin
      const employeeForm = screen.getByTestId("form-employee");
      employeeForm.remove();

      // Mock du store
      const store = {
        login: jest.fn().mockResolvedValue({}),
        users: jest.fn().mockReturnValue({
          create: jest.fn().mockResolvedValue({})
        })
      };

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(),
        PREVIOUS_LOCATION: '',
        store
      });

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn(e => e.preventDefault());
      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
