"use client";
import "bootstrap/dist/css/bootstrap.min.css";

function validatePhoneNumber(value) {
    const phoneNumberPattern = /^\(\d{3}\) \d{3}-\d{4}$/;
    if (value && !phoneNumberPattern.test(value)) {
      return "Invalid phone number format";
    }
    return undefined;
}

function childHasContent(child) {
    if (!child) return false;
    return Boolean(
        (child.firstName && child.firstName.trim()) ||
        (child.lastName && child.lastName.trim()) ||
        child.birthDate,
    );
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

        if (isNaN(birthDate.getTime())) {
        errors.dateOfBirth = "Invalid date format";
        } else if (birthDate > today) {
        errors.dateOfBirth = "Date of birth cannot be in the future";
        } else {
            const oldestAllowed = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
            if (birthDate < oldestAllowed) {
                errors.dateOfBirth = "Please enter a valid birth date";
            }
        }
    }

    const listedChildren = (values.children || []).filter(childHasContent);

    if (listedChildren.length > 0 && !values.relationshipToChildren) {
    errors.relationshipToChildren =
        "Please select your relationship to the child(ren)";
    }

    if (!values.firstNationMembership) { //added First Nation Validation
    errors.firstNationMembership = "Please select a First Nation";
    }

    if ( // added other validation only if needed
    values.firstNationMembership === "other" &&
    !values.otherFirstNation
    ) {
        errors.otherFirstNation = "Please select the other First Nation";
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

    (values.children || []).forEach((child, index) => {
        if (!childHasContent(child)) return;

        const childCfsAgentNumberError = validatePhoneNumber(
        child.childCfsAgentNumber
        );
        if (childCfsAgentNumberError) {
        if (!errors.children) errors.children = [];
        if (!errors.children[index]) errors.children[index] = {};
        errors.children[index].childCfsAgentNumber = childCfsAgentNumberError;
        }

        const childCfsSupervisorNumberError = validatePhoneNumber(
        child.childCfsSupervisorNumber
        );
        if (childCfsSupervisorNumberError) {
        if (!errors.children) errors.children = [];
        if (!errors.children[index]) errors.children[index] = {};
        errors.children[index].childCfsSupervisorNumber = childCfsSupervisorNumberError;
        }

        // Validate Birth Date only if provided
        if (child.birthDate) {
            const birthDate = new Date(child.birthDate);
            const today = new Date();
            const minDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());

            // Only initialize errors[index] if there's a problem
            let birthDateError = null;

            if (birthDate > today) {
            birthDateError = "Date of birth cannot be in the future";
            } else if (birthDate < minDate) {
            birthDateError = "Child must be between 0 and 20 years old";
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