import { NotifyClient} from 'notifications-node-client';

export default (config) => {

  return {
    sendEmail,
    previewEmail,
  };

  function sendEmail(email, templateId, personalisation) {
    const client = new NotifyClient(config.NOTIFY_KEY);

    // console.info({
    //   action: 'Sending email',
    //   email,
    //   templateId,
    //   personalisation,
    // });

    return client
      .sendEmail(
        templateId,
        email,
        { personalisation }
      )
      .then((notifyResponse) => {
        return true;
      })
      .catch(err => {
        console.error('Error Sending Email:', err);
        return false;
      });
  }

  function previewEmail(notificationId) {
    console.log('preview email', notificationId);
    const client = new NotifyClient(config.NOTIFY_KEY);
    return client
      .getTemplateById(notificationId)
      .then((response) => console.log(response))
      .catch((err) => console.error(err));
  }

};
