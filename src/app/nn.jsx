<FieldArray name="children">
{({ push, remove }) => (
    <div>
        {values.children
            .sort((a, b) => a.child_id - b.child_id) // Sort children by ascending child_id
            .map((child, index) => (
            <div key={`${child.child_id}-${index}`} className={`${styles.bglightgrey} border rounded p-2 mb-3`} >
                <Row className="mb-2">
                    <Col>
                        <h5>Child ID. {child.child_id}</h5>
                    </Col>
                </Row>
                <Row className="align-items-center">
                    <Col md={3}>
                        <InputField name={`children.${index}.firstName`} label="First Name:" disabled={!isEditing} />
                    </Col>
                    <Col md={3}>
                        <InputField name={`children.${index}.middleName`} label="Middle Name:" disabled={!isEditing} />
                    </Col>
                    <Col md={6}>
                        <InputField name={`children.${index}.lastName`} label="Last Name:" disabled={!isEditing} />
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col md={3}>
                        <div>
                            <label htmlFor={`children.${index}.birthDate`}>Date of Birth:</label>
                            <Field type="date" id={`children.${index}.birthDate`} name={`children.${index}.birthDate`} disabled={!isEditing} />
                            <ErrorMessage
                                name={`children.${index}.birthDate`}
                                component={() => <p className={styles.errorText}>{errors.children?.[index]?.birthDate}</p>}
                            />
                        </div>
                    </Col>
                    <Col md={6}>
                        <FirstNationSelect name={`children.${index}.childNation`} label="First Nation Membership" error={errors.childNation} disabled={!isEditing}/>
                    </Col>
                    <Col md={3}>
                        <InputField name={`children.${index}.childPlaced`} label="Place of Stay:" disabled={!isEditing} />
                    </Col>
                </Row>

                {/* Agency information */}
                <div className="bg-light border border-light p-3 rounded">
                    <Row className="mt-2">
                        <h5 className="text-dark">Agency Information</h5>
                        <Col md={4}>
                            <InputField name={`children.${index}.childCfsAgency`} label="CFS Agency Name:" disabled={!isEditing} />
                        </Col>
                        <Col md={4}>
                            <InputField name={`children.${index}.childCfsAgentFullName`} label="Agency Worker’s Full Name:" disabled={!isEditing} />
                        </Col>
                        <Col md={4}>
                            <div>
                                <label htmlFor={`children.${index}.childCfsAgentNumber`}>Phone Number:</label>
                                <Field type="number" id={`children.${index}.childCfsAgentNumber`} name={`children.${index}.childCfsAgentNumber`} disabled={!isEditing} />
                                <ErrorMessage
                                    name={`children.${index}.childCfsAgentNumber`}
                                    component={() => <p className={styles.errorText}>{errors.children?.[index]?.childCfsAgentNumber}</p>} />
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={4}>
                            <div>
                                <label htmlFor={`children.${index}.childCfsAgentEmail`}>Email:</label>
                                <Field type="email" id={`children.${index}.childCfsAgentEmail`} name={`children.${index}.childCfsAgentEmail`} disabled={!isEditing} />
                                <ErrorMessage
                                    name={`children.${index}.childCfsAgentEmail`}
                                    component={() => <p className={styles.errorText}>{errors.children?.[index]?.childCfsAgentEmail}</p>} />
                            </div>
                        </Col>
                        <Col  md={4}>
                            <StatusCFSFileSelect name={`children.${index}.childStatusCfsFile`} label="CFS File Status"  error={errors.children?.[index]?.childStatusCfsFile} disabled={!isEditing} />
                        </Col>
                    </Row>
                </div>

                {/* END Agency information */}

                <Row>
                    <Col md={9}></Col>
                    <Col md={3} className="d-flex align-items-end mt-2">
                        <Button className="w-100 btn btn-danger" type="button" onClick={() => remove(index)} disabled={!isEditing} >Delete</Button>
                    </Col>
                </Row>

            </div>
        ))}
        <Button className="btn-dark" type="button" onClick={() =>
            push({
                firstName: "",
                middleName: "",
                lastName: "",
                birthDate: "",
                childNation: "",
                childPlaced: "",
                childCfsAgency:"",
                childCfsAgentFullName:"",
                childCfsAgentNumber:"",
                childCfsAgentEmail:"",
                childStatusCfsFile:""
            })} disabled={!isEditing}>
            + Add Child
        </Button>
    </div>
)}
</FieldArray>