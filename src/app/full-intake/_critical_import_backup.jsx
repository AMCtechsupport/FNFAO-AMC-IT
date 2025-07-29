// From page.jsx
"use client";
import React, { useEffect, useState } from "react";
import UserHome from "../user-home/page";
import styles from "./fullIntake.module.css";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { Button, Container, Row, Col, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import ReferredBySelect from "@/components/ReferredBySelect";
import ProvincesSelect from "@/components/ProvincesSelect";
import RelationshipToChildrenSelect from "@/components/RelationshipToChildrenSelect";
import StatusCFSFileSelect from "@/components/StatusCFSFileSelect";
import FirstNationSelect from "@/components/FirstNationSelect";
import MartialStatusSelect from "@/components/MartialStatusSelect";
import TypeNoteSelect from "@/components/TypeNoteSelect";
import SubTypeNoteSelect from "@/components/SubTypeNoteSelect"
import GenderSelect from "@/components/GenderSelect";
import YesNoSelect from "../../components/yesNoSelect";
import FormattedDate from "@/components/FormattedDate";
import ManageCfsAgencies from "@/components/ManageCfsAgencies";

import { handleNotesUpdate } from "../utils/notesUpdates"; // handles updates to the Notes table
import { handleFamilyUpdate }  from "../utils/familyUpdates";
import { handleHomeMembersUpdate } from "../utils/homeMebersUpdate";
import { handleEIAUpdate } from "../utils/EIAUpdates";

import supabase from "../lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { isValidUUID } from '../utils/isValidUUID';
import { useUser } from '@clerk/clerk-react';

import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import FullIntakeForm from "../full-intake-components/fullIntakeForm";

// fullIntakeForm.jsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserHome from "../user-home/page";
import styles from "../full-intake/fullIntake.module.css";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { Button, Container, Row, Col, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import ReferredBySelect from "@/components/ReferredBySelect";
import ProvincesSelect from "@/components/ProvincesSelect";
import RelationshipToChildrenSelect from "@/components/RelationshipToChildrenSelect";
import StatusCFSFileSelect from "@/components/StatusCFSFileSelect";
import FirstNationSelect from "@/components/FirstNationSelect";
import MartialStatusSelect from "@/components/MartialStatusSelect";
import TypeNoteSelect from "@/components/TypeNoteSelect";
import SubTypeNoteSelect from "@/components/SubTypeNoteSelect"
import GenderSelect from "@/components/GenderSelect";
import YesNoSelect from "../../components/yesNoSelect";
import FormattedDate from "@/components/FormattedDate";
import ManageCfsAgencies from "@/components/ManageCfsAgencies";

import { handleNotesUpdate } from "../utils/notesUpdates"; // handles updates to the Notes table
import { handleFamilyUpdate }  from "../utils/familyUpdates";
import { handleHomeMembersUpdate } from "../utils/homeMebersUpdate";
import { handleEIAUpdate } from "../utils/EIAUpdates";

import supabase from "../lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { isValidUUID } from '../utils/isValidUUID';
import { useUser } from '@clerk/clerk-react';

import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { FormInitialValue, getFormInitialValues } from "./InitialValues";
import handleChildrenUpdate from "./childrenUpdate";

import CaseNotesPartition from "./CaseNotesPartition";
import LegalNotesPartition from "./LegalNotesPartition";

// CaseNotesPartition.jsx
"use client";
import { Field, ErrorMessage, FieldArray } from "formik";
import { Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import TypeNoteSelect from "@/components/TypeNoteSelect";
import SubTypeNoteSelect from "@/components/SubTypeNoteSelect"
import FormattedDate from "@/components/FormattedDate";
import "react-tabs/style/react-tabs.css";

// LegalNotesPartition.jsx
"use client";
import { Field, ErrorMessage, FieldArray } from "formik";
import { Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import TypeNoteSelect from "@/components/TypeNoteSelect";
import SubTypeNoteSelect from "@/components/SubTypeNoteSelect"
import FormattedDate from "@/components/FormattedDate";
import "react-tabs/style/react-tabs.css";

// childrenUpdate.jsx
import supabase from "../lib/supabase";