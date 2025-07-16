"use client";
import { useState, useEffect } from "react";
import supabase from "../../lib/supabase";

function YouthIntakeFetchClientData(initialYouthForm, isEditMode, editClientId) {
    const [initialValues, setInitialValues] = useState(initialYouthForm);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch existing client data when in edit mode
    useEffect(() => {
        const fetchClientData = async () => {
        if (!isEditMode || !editClientId) return;

    try {
        setIsLoading(true);
        // Fetch main client data
        const { data: clientData, error: clientError } = await supabase
          .from("Clients")
          .select("*")
          .eq("client_id", editClientId)
          .single();

        if (clientError) {
          console.error("Error fetching client data:", clientError);
          alert("Error loading client data. Please try again.");
          return;
        }

        // Fetch home members
        const { data: homeMembers, error: homeMembersError } = await supabase
          .from("Home Members")
          .select("*")
          .eq("client_id", editClientId);

        // Fetch educational persons
        const { data: educationalPersons, error: educationalError } = await supabase
          .from("Educational Support Persons")
          .select("*")
          .eq("client_id", editClientId);

        // Fetch emergency contact
        const { data: emergencyContact, error: emergencyError } = await supabase
          .from("Emergency Contacts")
          .select("*")
          .eq("client_id", editClientId)
          .single();

        // Helper function to decode HTML entities
        const decodeHtmlEntities = (text) => {
          if (!text) return "";
          const textarea = document.createElement('textarea');
          textarea.innerHTML = text;
          return textarea.value;
        };

        // Decode HTML entities for main client text fields
        const decodedClientData = {};
        for (const [key, value] of Object.entries(clientData)) {
          if (typeof value === 'string') {
            decodedClientData[key] = decodeHtmlEntities(value);
          } else {
            decodedClientData[key] = value;
          }
        }

        // Populate form with fetched data
        const populatedValues = {
          ...decodedClientData,
          // Format date for HTML date input (YYYY-MM-DD)
          dateOfBirth: clientData.dateOfBirth ? 
            new Date(clientData.dateOfBirth).toISOString().split('T')[0] : "",
          // Handle pronouns case conversion (already decoded in decodedClientData)
          pronouns: decodedClientData.pronouns ? decodedClientData.pronouns.toLowerCase() : "",
          // Map emergency contact data (decode HTML entities)
          emergencyContactFirstName: decodeHtmlEntities(emergencyContact?.firstName) || "",
          emergencyContactLastName: decodeHtmlEntities(emergencyContact?.lastName) || "",
          emergencyContactNumber: decodeHtmlEntities(emergencyContact?.phoneNumber) || "",
          // Handle home members (ensure at least one empty entry if none exist)
          homeMembers: homeMembers && homeMembers.length > 0 
            ? homeMembers.map(member => ({
                firstName: member.firstName || "",
                middleName: member.middleName || "",
                lastName: member.lastName || "",
                relationship: member.relationship || "",
                phoneNumber: member.phoneNumber || "",
                email: member.email || "",
              }))
            : [{
                firstName: "",
                middleName: "",
                lastName: "",
                relationship: "",
                phoneNumber: "",
                email: "",
              }],
          // Handle educational persons (ensure at least one empty entry if none exist)
          educationalPersons: educationalPersons && educationalPersons.length > 0
            ? educationalPersons.map(person => ({
                firstName: person.firstName || "",
                middleName: person.middleName || "",
                lastName: person.lastName || "",
                relationship: person.relationship || "",
                phoneNumber: person.phoneNumber || "",
                email: person.email || "",
              }))
            : [{
                firstName: "",
                middleName: "",
                lastName: "",
                relationship: "",
                phoneNumber: "",
                email: "",
              }],
          // Convert boolean fields to proper formats
          // Checkbox fields (keep as boolean)
          birthCertificate: clientData.birthCertificate || false,
          driversLicense: clientData.driversLicense || false,
          healthCard: clientData.healthCard || false,
          statusCard: clientData.statusCard || false,
          enhancedID: clientData.enhancedID || false,
          studentID: clientData.studentID || false,
          // Radio button fields (convert boolean to "yes"/"no" strings)
          inCare: clientData.inCare ? "yes" : (clientData.inCare === false ? "no" : ""),
          onReserve: clientData.onReserve ? "yes" : (clientData.onReserve === false ? "no" : ""),
          apprehendedOnReserve: clientData.apprehendedOnReserve ? "yes" : (clientData.apprehendedOnReserve === false ? "no" : ""),
          transitionFromReserve: clientData.transitionFromReserve ? "yes" : (clientData.transitionFromReserve === false ? "no" : ""),
          inSchool: clientData.inSchool ? "yes" : (clientData.inSchool === false ? "no" : ""),
          fullStudent: clientData.fullStudent ? "yes" : (clientData.fullStudent === false ? "no" : ""),
          bankAccount: clientData.bankAccount ? "yes" : (clientData.bankAccount === false ? "no" : ""),
          incomeAssistance: clientData.incomeAssistance ? "yes" : (clientData.incomeAssistance === false ? "no" : ""),
          youthJustice: clientData.youthJustice ? "yes" : (clientData.youthJustice === false ? "no" : ""),
          accessElder: clientData.accessElder ? "yes" : (clientData.accessElder === false ? "no" : ""),
          speakingOffice: clientData.speakingOffice ? "yes" : (clientData.speakingOffice === false ? "no" : ""),
          youthWorkshops: clientData.youthWorkshops ? "yes" : (clientData.youthWorkshops === false ? "no" : ""),
          disabilities: clientData.disabilities ? "yes" : (clientData.disabilities === false ? "no" : ""),
          connectedCommunity: clientData.connectedCommunity ? "yes" : (clientData.connectedCommunity === false ? "no" : ""),
        };

        setInitialValues(populatedValues);
      } catch (error) {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [isEditMode, editClientId]);
  return { initialValues, isLoading}
}

export default YouthIntakeFetchClientData;