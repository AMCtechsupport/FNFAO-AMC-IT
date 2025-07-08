"use client";
import "bootstrap/dist/css/bootstrap.min.css";

function validatePhoneNumber(value) {
    const phoneNumberPattern = /^\(\d{3}\) \d{3}-\d{4}$/;
    if (value && !phoneNumberPattern.test(value)) {
      return "Invalid phone number format";
    }
    return undefined;
}

const PreIntakeInputValidation=
(values) => {
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
        errors.dateOfBirth = "Please choose a valid birth date";
    } else {
        const birthDate = new Date(values.dateOfBirth);
        const today = new Date();
        const minYear = today.getFullYear() - 150;
        const maxYear = today.getFullYear() - 5;

        if (isNaN(birthDate.getTime())) {
        errors.dateOfBirth = "Invalid date format";
        } else if (birthDate > today) {
        errors.dateOfBirth = "Date of birth cannot be in the future";
        } else if (
        birthDate.getFullYear() < minYear ||
        birthDate.getFullYear() > maxYear
        ) {
        errors.dateOfBirth = `Date of birth must be between ${minYear} and ${maxYear}`;
        }
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

    values.children.forEach((child, index) => {
        const childCfsAgentNumberError = validatePhoneNumber(
        child.childCfsAgentNumber
        );
        if (childCfsAgentNumberError) {
        if (!errors.children) errors.children = [];
        if (!errors.children[index]) errors.children[index] = {};
        errors.children[index].childCfsAgentNumber = childCfsAgentNumberError;
        }

        // Validate Birth Date only if provided
        if (child.birthDate) {
            const birthDate = new Date(child.birthDate);
            const today = new Date();
            const minDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());

            // Only initialize errors[index] if there's a problem
            let birthDateError = null;

            if (birthDate > today) {
            birthDateError = "Date of birth cannot be in the future";
            } else if (birthDate < minDate) {
            birthDateError = "Child must be between 0 and 17 years old";
            }

            if (birthDateError) {
            if (!errors.children) errors.children = [];
            if (!errors.children[index]) errors.children[index] = {};
            errors.children[index].birthDate = birthDateError;
            }
        }
    });

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

    // Validation for 9 digits (only if the user enters something)
    if (
        values.ninePersonalHealthNumber &&
        !/^\d{9}$/.test(values.ninePersonalHealthNumber)
    ) {
        errors.ninePersonalHealthNumber = "Must be exactly 9 digits";
    }

    if (
        values.treatyNumber &&
        !/^\d{9}$/.test(values.treatyNumber)
    ) {
        errors.treatyNumber = "Treaty number must be exactly 9 digits";
    }


    // Validation for 6 digits (only if the user enters something)
    if (
        values.sixPersonalHealthNumber &&
        !/^\d{6}$/.test(values.sixPersonalHealthNumber)
    ) {
        errors.sixPersonalHealthNumber = "Must be exactly 6 digits";
    }

    if (
        values.criminalCharges === "yes" &&
        !values.criminalChargesSpecified
    ) {
        errors.criminalChargesSpecified = "Please specify why.";
    }

    if (values.activeWarrant === "yes" && !values.activeWarrantSpecified) {
        errors.activeWarrantSpecified = "Please specify why.";
    }

    if (
        values.activeInvestigation  === "yes" &&
        !values.activeInvestigationExplained
    ) {
        errors.activeInvestigationExplained = "Please select a start date.";
    }
    if (values.activeOrders === "yes" && !values.activeOrdersExplained) {
        errors.activeOrdersExplained = "Please specify why.";
    }

    if (values.activeInvestigation === "yes") {
        const dateStr = values.activeInvestigationExplained;

        if (!dateStr) {
        errors.activeInvestigationExplained = "Please provide the start date of the investigation";
        } else {
        const date = new Date(dateStr);
        const today = new Date();
        const eightyYearsAgo = new Date(today.getFullYear() - 80, today.getMonth(), today.getDate());

        if (date > today) {
            errors.activeInvestigationExplained = "Date cannot be in the future";
        } else if (date < eightyYearsAgo) {
            errors.activeInvestigationExplained = `Date must be within the last 80 years (${eightyYearsAgo.getFullYear()}–${today.getFullYear()})`;
        }
        }
    }

    return errors;
}
export default PreIntakeInputValidation;