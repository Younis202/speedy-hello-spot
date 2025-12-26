import { useState } from 'react';
import { Plus, Phone, Mail, User, Briefcase, X, Edit3, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Contact } from '@/types';

interface ContactsTabProps {
  contacts: Contact[];
  onUpdateContacts: (contacts: Contact[]) => void;
}

export const ContactsTab = ({ contacts, onUpdateContacts }: ContactsTabProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newContact, setNewContact] = useState<Contact>({ name: '', phone: '', role: '' });
  const [editContact, setEditContact] = useState<Contact>({ name: '', phone: '', role: '' });

  const handleAddContact = () => {
    if (!newContact.name.trim()) return;
    onUpdateContacts([...contacts, newContact]);
    setNewContact({ name: '', phone: '', role: '' });
    setIsAdding(false);
  };

  const handleUpdateContact = (index: number) => {
    if (!editContact.name.trim()) return;
    const updated = [...contacts];
    updated[index] = editContact;
    onUpdateContacts(updated);
    setEditingIndex(null);
  };

  const handleDeleteContact = (index: number) => {
    const updated = contacts.filter((_, i) => i !== index);
    onUpdateContacts(updated);
  };

  const startEditing = (index: number) => {
    setEditContact(contacts[index]);
    setEditingIndex(index);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Add Contact Button/Form */}
      <div className="card-elegant p-6">
        {!isAdding ? (
          <Button 
            onClick={() => setIsAdding(true)}
            className="w-full bg-gradient-primary hover:opacity-90 gap-2 py-6"
          >
            <Plus className="w-5 h-5" />
            إضافة جهة اتصال جديدة
          </Button>
        ) : (
          <div className="space-y-4">
            <h3 className="section-title">
              <User className="w-5 h-5 text-primary" />
              إضافة جهة اتصال
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">الاسم *</label>
                <Input
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="اسم الشخص"
                />
              </div>
              <div>
                <label className="form-label">رقم التليفون</label>
                <Input
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="form-label">الدور/المنصب</label>
                <Input
                  value={newContact.role}
                  onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                  placeholder="مثال: مدير المشتريات"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleAddContact} className="bg-gradient-primary hover:opacity-90 gap-2">
                <Check className="w-4 h-4" />
                إضافة
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Contacts List */}
      {contacts.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 stagger-children">
          {contacts.map((contact, index) => (
            <div key={index} className="card-premium p-5 group">
              {editingIndex === index ? (
                <div className="space-y-4">
                  <div className="grid gap-3">
                    <Input
                      value={editContact.name}
                      onChange={(e) => setEditContact({ ...editContact, name: e.target.value })}
                      placeholder="الاسم"
                    />
                    <Input
                      value={editContact.phone}
                      onChange={(e) => setEditContact({ ...editContact, phone: e.target.value })}
                      placeholder="رقم التليفون"
                      dir="ltr"
                    />
                    <Input
                      value={editContact.role}
                      onChange={(e) => setEditContact({ ...editContact, role: e.target.value })}
                      placeholder="الدور/المنصب"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdateContact(index)} className="gap-1">
                      <Check className="w-4 h-4" />
                      حفظ
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
                      {contact.name?.charAt(0) || '؟'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg truncate">{contact.name}</h4>
                      {contact.role && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                          <Briefcase className="w-4 h-4" />
                          {contact.role}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => startEditing(index)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-danger hover:text-danger"
                        onClick={() => handleDeleteContact(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {contact.phone && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <a 
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-success/10 text-success hover:bg-success/20 transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                        <span className="font-medium" dir="ltr">{contact.phone}</span>
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {contacts.length === 0 && !isAdding && (
        <div className="card-elegant p-12">
          <div className="empty-state">
            <User className="empty-state-icon" />
            <p className="empty-state-title">مفيش جهات اتصال</p>
            <p className="empty-state-description">أضف جهات الاتصال المرتبطة بالمصلحة دي</p>
          </div>
        </div>
      )}
    </div>
  );
};
