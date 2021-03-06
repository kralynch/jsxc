import Message from '../Message'
import { AbstractPlugin } from '../plugin/AbstractPlugin'
import PluginAPI from '../plugin/PluginAPI'
import Contact from '../Contact'
import Translation from '../util/Translation'
import Notification from '../Notification'
import { Presence } from '../connection/AbstractConnection'
import { SOUNDS } from '../CONST'

const MIN_VERSION = '4.0.0';
const MAX_VERSION = '99.0.0';

export default class NotificationPlugin extends AbstractPlugin {
   public static getId(): string {
      return 'notification';
   }

   public static getName(): string {
      return 'Desktop Notification';
   }

   public static getDescription(): string {
      return Translation.t('setting-notification-enable');
   }

   constructor(pluginAPI: PluginAPI) {
      super(MIN_VERSION, MAX_VERSION, pluginAPI);

      pluginAPI.addAfterReceiveMessageProcessor(this.afterReceiveMessageProcessor, 90);
      pluginAPI.addAfterReceiveGroupMessageProcessor(this.afterReceiveMessageProcessor, 90);

      pluginAPI.registerPresenceHook(this.onPresence);
   }

   private afterReceiveMessageProcessor = (contact: Contact, message: Message): Promise<any> => {
      if ((message.getPlaintextMessage() || message.getAttachment()) && message.isIncoming()) {
         Notification.notify({
            title: Translation.t('New_message_from', {
               name: contact.getName(),
            }),
            message: message.getPlaintextMessage(),
            soundFile: SOUNDS.MSG,
            source: contact
         });
         //open the chat window for all incoming messages
         contact.getChatWindowController().openProminently();

         //play notification sound
         Notification.playSound(SOUNDS.MSG,false,true);
      }

      return Promise.resolve([contact, message]);
   }

   private onPresence = (contact: Contact, newPresence, oldPresence) => {
      if (oldPresence !== Presence.offline || newPresence === Presence.offline) {
         return;
      }

      let now = new Date();
      let created = this.pluginAPI.getConnectionCreationDate() || now;

      if (!created || (now.valueOf() - created.valueOf()) < 2 * 60 * 1000) {
         return;
      }
      //disable presence notifications
      /*
      Notification.notify({
         title: contact.getName(),
         message: Translation.t('has_come_online'),
         source: contact
      });
      */
   }
}
