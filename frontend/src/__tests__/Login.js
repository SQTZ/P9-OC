/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { fireEvent, screen } from "@testing-library/dom";

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
