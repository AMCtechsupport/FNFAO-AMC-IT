const fullIntakeInputValidation= (values) => {
    let errors = {};
    // Validations - Only require essential fields
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
        errors.lastName =
        "The last name can only contain letters and spaces";
    }

    // Optional field validations - only validate format if provided
    if (values.dateOfBirth) {
        const birthDate = new Date(values.dateOfBirth);
        const currentYear = new Date().getFullYear();
        const birthYear = birthDate.getFullYear();

        // Year validation
        if (birthYear > currentYear) {
        errors.dateOfBirth = "Birth year cannot be in the future";
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

    // Phone number - optional, but validate format if provided
    // Note: Remove the required validation

    // Address - optional, but validate format if provided
    const addressRegex = /^[a-zA-Z0-9\s,.-]*$/;
    if (values.address && !addressRegex.test(values.address)) {
        errors.address = "The address contains invalid characters";
    }

    // City - optional, but validate format if provided
    if (values.city && !/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.city)) {
        errors.city = "The city can only contain letters and spaces";
    }

    // Province - optional, no validation needed

    // Postal code - optional, but validate format if provided
    if (
        values.postalCode &&
        !/^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(values.postalCode)
    ) {
        errors.postalCode = "Invalid postal code format (e.g., A1A 1A1)";
    }

    // Email - optional, but validate format if provided
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = "Invalid email format";
    }

    // Validation for 9 digits (only if the user enters something)
    if (
        values.ninePersonalHealthNumber &&
        !/^\d{9}$/.test(values.ninePersonalHealthNumber)
    ) {
        errors.ninePersonalHealthNumber = "Must be exactly 9 digits";
    }
    
    // Validation for 6 digits (only if the user enters something)
    if (
        values.sixPersonalHealthNumber &&
        !/^\d{6}$/.test(values.sixPersonalHealthNumber)
    ) {
        errors.sixPersonalHealthNumber = "Must be exactly 6 digits";
    }

    return errors;
}

export default fullIntakeInputValidation;