import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiBriefcase, FiMail, FiPhone, FiMap, FiDollarSign, FiSettings } from 'react-icons/fi';
import styles from './AddNewProspects.module.css';

const AddNewProspects = ({ isOpen, onClose, onSave, lookupData }) => {
    const [formData, setFormData] = useState({
        Fullname: '',
        Firstname: '',
        Lastname: '',
        Jobtitle: '',
        Company: '',
        Website: '',
        Personallinkedin: '',
        Companylinkedin: '',
        Altphonenumber: '',
        Companyphonenumber: '',
        Email: '',
        Emailcode: '',
        Address: '',
        Street: '',
        City: '',
        State: '',
        Postalcode: '',
        Country: '',
        Annualrevenue: '',
        Industry: '',
        Employeesize: '',
        Siccode: '',
        Naicscode: '',
        Dispositioncode: '',
        Providercode: '',
        Comments: '',
        Department: '',
        Seniority: '',
        Status: 'New'
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal closes
            setFormData({
                Fullname: '',
                Firstname: '',
                Lastname: '',
                Jobtitle: '',
                Company: '',
                Website: '',
                Personallinkedin: '',
                Companylinkedin: '',
                Altphonenumber: '',
                Companyphonenumber: '',
                Email: '',
                Emailcode: '',
                Address: '',
                Street: '',
                City: '',
                State: '',
                Postalcode: '',
                Country: '',
                Annualrevenue: '',
                Industry: '',
                Employeesize: '',
                Siccode: '',
                Naicscode: '',
                Dispositioncode: '',
                Providercode: '',
                Comments: '',
                Department: '',
                Seniority: '',
                Status: 'New'
            });
            setErrors({});
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when field is updated
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.Fullname.trim()) newErrors.Fullname = 'Full name is required';
        if (!formData.Email.trim()) newErrors.Email = 'Email is required';
        if (!formData.Company.trim()) newErrors.Company = 'Company is required';

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.Email && !emailRegex.test(formData.Email)) {
            newErrors.Email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving prospect:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>Add New Prospect</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formContent}>
                        {/* Personal Information Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <FiUser className={styles.sectionIcon} />
                                <h3>Personal Information</h3>
                            </div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        name="Fullname"
                                        value={formData.Fullname}
                                        onChange={handleChange}
                                        className={errors.Fullname ? styles.errorInput : ''}
                                    />
                                    {errors.Fullname && <span className={styles.errorText}>{errors.Fullname}</span>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        name="Firstname"
                                        value={formData.Firstname}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        name="Lastname"
                                        value={formData.Lastname}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Job Title</label>
                                    <input
                                        type="text"
                                        name="Jobtitle"
                                        value={formData.Jobtitle}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="Email"
                                        value={formData.Email}
                                        onChange={handleChange}
                                        className={errors.Email ? styles.errorInput : ''}
                                    />
                                    {errors.Email && <span className={styles.errorText}>{errors.Email}</span>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Email Status</label>
                                    <select
                                        name="Emailcode"
                                        value={formData.Emailcode}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Status</option>
                                        {lookupData.emailStatuses?.map(status => (
                                            <option key={status.EmailCode} value={status.EmailCode}>
                                                {status.EmailName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Company Information Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <FiBriefcase className={styles.sectionIcon} />
                                <h3>Company Information</h3>
                            </div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Company *</label>
                                    <input
                                        type="text"
                                        name="Company"
                                        value={formData.Company}
                                        onChange={handleChange}
                                        className={errors.Company ? styles.errorInput : ''}
                                    />
                                    {errors.Company && <span className={styles.errorText}>{errors.Company}</span>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Website</label>
                                    <input
                                        type="url"
                                        name="Website"
                                        value={formData.Website}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Industry</label>
                                    <select
                                        name="Industry"
                                        value={formData.Industry}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Industry</option>
                                        {lookupData.industries?.map(industry => (
                                            <option key={industry.IndustryCode} value={industry.IndustryCode}>
                                                {industry.IndustryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Employee Size</label>
                                    <input
                                        type="number"
                                        name="Employeesize"
                                        value={formData.Employeesize}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Annual Revenue</label>
                                    <div className={styles.currencyInput}>
                                        <span className={styles.currencySymbol}>$</span>
                                        <input
                                            type="number"
                                            name="Annualrevenue"
                                            value={formData.Annualrevenue}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <FiPhone className={styles.sectionIcon} />
                                <h3>Contact Information</h3>
                            </div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Company Phone</label>
                                    <input
                                        type="tel"
                                        name="Companyphonenumber"
                                        value={formData.Companyphonenumber}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Alternate Phone</label>
                                    <input
                                        type="tel"
                                        name="Altphonenumber"
                                        value={formData.Altphonenumber}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Personal LinkedIn</label>
                                    <input
                                        type="url"
                                        name="Personallinkedin"
                                        value={formData.Personallinkedin}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Company LinkedIn</label>
                                    <input
                                        type="url"
                                        name="Companylinkedin"
                                        value={formData.Companylinkedin}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/company/companyname"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Information Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <FiMap className={styles.sectionIcon} />
                                <h3>Address Information</h3>
                            </div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        name="Address"
                                        value={formData.Address}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Street</label>
                                    <input
                                        type="text"
                                        name="Street"
                                        value={formData.Street}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>City</label>
                                    <input
                                        type="text"
                                        name="City"
                                        value={formData.City}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>State</label>
                                    <input
                                        type="text"
                                        name="State"
                                        value={formData.State}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Postal Code</label>
                                    <input
                                        type="text"
                                        name="Postalcode"
                                        value={formData.Postalcode}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Country</label>
                                    <select
                                        name="Country"
                                        value={formData.Country}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Country</option>
                                        {lookupData.countries?.map(country => (
                                            <option key={country} value={country}>
                                                {country}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <FiSettings className={styles.sectionIcon} />
                                <h3>Additional Information</h3>
                            </div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Status</label>
                                    <select
                                        name="Status"
                                        value={formData.Status}
                                        onChange={handleChange}
                                    >
                                        <option value="New">New</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Qualified">Qualified</option>
                                        <option value="Proposal">Proposal</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Department</label>
                                    <input
                                        type="text"
                                        name="Department"
                                        value={formData.Department}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Seniority</label>
                                    <input
                                        type="text"
                                        name="Seniority"
                                        value={formData.Seniority}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Disposition</label>
                                    <select
                                        name="Dispositioncode"
                                        value={formData.Dispositioncode}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Disposition</option>
                                        {lookupData.dispositions?.map(disp => (
                                            <option key={disp.DispositionCode} value={disp.DispositionCode}>
                                                {disp.DispositionName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Provider</label>
                                    <select
                                        name="Providercode"
                                        value={formData.Providercode}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Provider</option>
                                        {lookupData.providers?.map(provider => (
                                            <option key={provider.ProviderCode} value={provider.ProviderCode}>
                                                {provider.ProviderName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>SIC Code</label>
                                    <input
                                        type="number"
                                        name="Siccode"
                                        value={formData.Siccode}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>NAICS Code</label>
                                    <input
                                        type="number"
                                        name="Naicscode"
                                        value={formData.Naicscode}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <FiMail className={styles.sectionIcon} />
                                <h3>Comments</h3>
                            </div>
                            <div className={styles.formGroup}>
                                <textarea
                                    name="Comments"
                                    value={formData.Comments}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Add any additional comments or notes about this prospect..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelButton}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={styles.saveButton}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Prospect'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNewProspects;