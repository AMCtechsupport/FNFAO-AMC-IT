function validatePhoneNumber(value) {
  const phoneNumberPattern = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (value && !phoneNumberPattern.test(value)) {
    return "Invalid phone number format";
  }
  return undefined;
}

const youthIntakeInputValidation= (values) => {
    let errors = {};

    if (!values.firstName) {
        errors.firstName = "Please enter a name";
    } else if (!/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.firstName)) {
        errors.firstName = "The name can only contain letters and spaces";
    }

    if (
        values.middleName &&
        !/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.middleName)
    ) {
        errors.middleName =
        "The middle name can only contain letters and spaces";
    }

    if (!values.lastName) {
        errors.lastName = "Please enter a last name";
    } else if (!/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.lastName)) {
        errors.lastName = "The last name can only contain letters and spaces";
    }

    if (!values.dateOfBirth) {
        errors.dateOfBirth = "Please select a birth date";
    } else {
        const birthDate = new Date(values.dateOfBirth);
        const today = new Date();

        // Verify that the date of birth is not in the future
        if (birthDate > today) {
        errors.dateOfBirth = "Birth date cannot be in the future";
        }

        // Month validation
        const birthMonth = birthDate.getMonth() + 1;
        if (birthMonth < 1 || birthMonth > 12) {
        errors.dateOfBirth = "Birth month must be between 01 and 12";
        }

        // Day validation
        const birthDay = birthDate.getDate();
        if (birthDay < 1 || birthDay > 31) {
        errors.dateOfBirth = "Birth day must be between 01 and 31";
        }
    }

    const addressRegex = /^[a-zA-Z0-9\s,.-]*$/;
    if (!addressRegex.test(values.address)) {
        errors.address = "The address contains invalid characters";
    }

    if (values.city && !/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.city)) {
        errors.city = "The city can only contain letters and spaces";
    }

    if (
        values.postalCode &&
        !/^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(values.postalCode)
    ) {
        errors.postalCode = "Invalid postal code format (e.g., A1A 1A1)";
    }

    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = "Invalid email format";
    }

    if (
        values.cfsAgentEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.cfsAgentEmail)
    ) {
        errors.cfsAgentEmail = "Invalid email format";
    }

    if (
        values.caseWorkerEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.caseWorkerEmail)
    ) {
        errors.caseWorkerEmail = "Invalid email format";
    }

    if (
        values.emergencyContactFirstName &&
        !/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.emergencyContactFirstName)
    ) {
        errors.emergencyContactFirstName =
        "The emergency contact name can only contain letters and spaces";
    }

    if (
        values.emergencyContactLastName &&
        !/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.emergencyContactLastName)
    ) {
        errors.emergencyContactLastName =
        "The emergency contact last name can only contain letters and spaces";
    }

    if (values.peopleHome && !/^\d+$/.test(values.peopleHome)) {
        errors.peopleHome =
        "The number of people at home must contain only digits";
    }

    const phoneNumberError = validatePhoneNumber(values.phoneNumber);
    if (phoneNumberError) {
        errors.phoneNumber = phoneNumberError;
    }

    const emergencyContactNumberError = validatePhoneNumber(
        values.emergencyContactNumber
    );
    if (emergencyContactNumberError) {
        errors.emergencyContactNumber = emergencyContactNumberError;
    }

    const cfsAgentNumberError = validatePhoneNumber(values.cfsAgentNumber);
    if (cfsAgentNumberError) {
        errors.cfsAgentNumber = cfsAgentNumberError;
    }

    const caseWorkerPhoneNumberError = validatePhoneNumber(
        values.caseWorkerPhoneNumber
    );
    if (caseWorkerPhoneNumberError) {
        errors.caseWorkerPhoneNumber = caseWorkerPhoneNumberError;
    }

    return errors;
}
export default youthIntakeInputValidation;